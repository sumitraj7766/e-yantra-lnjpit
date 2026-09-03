import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { db } from './db.js';
import { getDatabaseStatus } from './mongodb.js';
import { IUser } from './models/User.js';
import cloudinary from './cloudinary';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'eyantra-lnjpit-super-secret-key-2026';

// Helper for saving uploaded profile photos permanently to MongoDB Atlas & local disk cache
// Helper for saving uploaded profile photos to Cloudinary
// MongoDB stores only the permanent Cloudinary URL + public ID.
async function saveUploadedPhoto(
  base64Data: string,
  originalFilename?: string,
  uploadedBy?: string,
  teamMemberId?: string
): Promise<{
  url: string;
  filename: string;
  storageId: string;
  publicId: string;
  size: number;
  mimeType: string;
}> {
  let mimeType = 'image/jpeg';
  let cleanBase64 = base64Data;

  const match = base64Data.match(
    /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/
  );

  if (match) {
    mimeType = `image/${match[1].toLowerCase()}`;
    cleanBase64 = match[2];
  }

  let ext = 'jpg';

  if (mimeType.includes('png')) {
    ext = 'png';
  } else if (mimeType.includes('webp')) {
    ext = 'webp';
  } else if (mimeType.includes('gif')) {
    ext = 'gif';
  } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    ext = 'jpg';
  } else {
    throw new Error(
      'Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF'
    );
  }

  const buffer = Buffer.from(cleanBase64, 'base64');

  if (!buffer.length) {
    throw new Error('Invalid or empty image data');
  }

  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Image exceeds 5MB limit');
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 8);

  const cleanName = (originalFilename || 'photo')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 20);

  const safeFilename =
    `team_${timestamp}_${cleanName}_${randomSuffix}.${ext}`;

  // Unique Cloudinary public ID
  const publicId =
    `team_photo_${timestamp}_${randomSuffix}`;

  // Upload image directly to Cloudinary
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'eyantra-lnjpit/team',
        public_id: publicId,
        resource_type: 'image',
        overwrite: true
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });

  if (!uploadResult?.secure_url) {
    throw new Error('Cloudinary upload failed');
  }

  console.log(
    `[Cloudinary] Photo uploaded successfully: ${uploadResult.secure_url}`
  );

  // Store metadata + permanent Cloudinary URL in MongoDB.
  // DO NOT store the image Buffer anymore.
  await db.saveStoredPhoto({
    publicId: safeFilename,
    filename: safeFilename,
    mimeType,
    url: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    size: buffer.length,
    uploadedBy: uploadedBy || '',
    teamMemberId: teamMemberId || ''
  });

  return {
    // Keep the existing API route so frontend requires NO change.
    url: `/api/photos/${safeFilename}`,

    filename: safeFilename,

    // Used by existing team-member code.
    storageId: safeFilename,

    // Keep the Cloudinary public ID available.
    publicId: uploadResult.public_id,

    size: buffer.length,
    mimeType
  };
}

// Helper to remove obsolete image files from MongoDB Atlas and local disk
// Helper to remove obsolete photos from Cloudinary + MongoDB + local cache
async function deleteLocalPhoto(photoIdentifier?: string) {
  if (!photoIdentifier) return;

  try {
    const identifier = String(photoIdentifier).trim();

    if (!identifier) return;

    // Find stored photo metadata first
    const storedPhoto = await db.getStoredPhoto(identifier);

    // Delete from Cloudinary if this is a Cloudinary image
    if (storedPhoto && (storedPhoto as any).cloudinaryPublicId) {
      const cloudinaryPublicId =
        (storedPhoto as any).cloudinaryPublicId;

      try {
        await cloudinary.uploader.destroy(
          cloudinaryPublicId,
          {
            resource_type: 'image',
            invalidate: true
          }
        );

        console.log(
          `[Cloudinary] Removed photo: ${cloudinaryPublicId}`
        );
      } catch (cloudinaryErr: any) {
        console.warn(
          '[Cloudinary] Delete warning:',
          cloudinaryErr.message
        );
      }
    }

    // Delete from MongoDB StoredPhoto
    await db.deleteStoredPhoto(identifier);

    // Delete old local cache if it exists
    const filename = path.basename(identifier);

    if (
      filename &&
      !filename.includes('..') &&
      !filename.includes('/') &&
      !filename.includes('\\')
    ) {
      const targetPath = path.join(
        process.cwd(),
        'uploads',
        'team',
        filename
      );

      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);

        console.log(
          `[Storage] Removed local cached photo: ${filename}`
        );
      }
    }
  } catch (err: any) {
    console.warn(
      '[Storage] Photo cleanup warning:',
      err.message
    );
  }
}

// Helper for JWT verify
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    (req as any).user = user;
    next();
  });
};

// Helper for Sanitizing User Objects (never expose password/hash)
function sanitizeUser(u: any): any {
  if (!u) return u;
  const raw = u.toObject ? u.toObject() : { ...u };
  delete raw.password;
  return raw;
}

// Helper for Admin authorization
const requireAdmin = (req: Request, res: Response, next: any) => {
  authenticateToken(req, res, () => {
    const user = (req as any).user;
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'FACULTY')) {
      next();
    } else {
      res.status(403).json({ error: 'Administrator privileges required' });
    }
  });
};

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }
  return aiClient;
}

// ==========================================
// DATABASE STATUS ENDPOINT
// ==========================================

router.get('/db-status', async (req: Request, res: Response) => {
  const status = getDatabaseStatus();
  res.json({
    database: 'MongoDB Atlas',
    ...status,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// PHOTO SERVING & RETRIEVAL (MONGODB + CACHE)
// ==========================================
router.get('/photos/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    const cleanId = path.basename(identifier);

    if (
      !cleanId ||
      cleanId.includes('..') ||
      cleanId.includes('/') ||
      cleanId.includes('\\')
    ) {
      return res.status(400).json({ error: 'Invalid photo identifier' });
    }

    // 1. Get photo information from MongoDB
    const photo = await db.getStoredPhoto(cleanId);

    if (photo) {
      // 2. NEW: If photo is stored on Cloudinary,
      // redirect directly to the permanent Cloudinary URL
      if ((photo as any).url) {
        return res.redirect((photo as any).url);
      }

      // 3. OLD: Check local disk cache
      const diskPath = path.join(
        process.cwd(),
        'uploads',
        'team',
        cleanId
      );

      if (fs.existsSync(diskPath)) {
        return res.sendFile(diskPath);
      }

      // 4. OLD: Serve image from MongoDB Buffer
      if (photo.data) {
        let imageBuffer: Buffer;

        if (Buffer.isBuffer(photo.data)) {
          imageBuffer = photo.data;
        } else if (
          (photo.data as any)?.buffer &&
          Buffer.isBuffer((photo.data as any).buffer)
        ) {
          imageBuffer = (photo.data as any).buffer;
        } else {
          imageBuffer = Buffer.from(photo.data as any);
        }

        if (imageBuffer && imageBuffer.length > 0) {
          // Re-create local cache for old images
          try {
            const uploadsDir = path.join(
              process.cwd(),
              'uploads',
              'team'
            );

            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            await fs.promises.writeFile(
              diskPath,
              imageBuffer
            );
          } catch (cacheErr) {
            // Ignore cache errors
          }

          res.setHeader(
            'Content-Type',
            photo.mimeType || 'image/jpeg'
          );

          res.setHeader(
            'Content-Length',
            String(imageBuffer.length)
          );

          res.setHeader(
            'Cache-Control',
            'public, max-age=31536000, immutable'
          );

          return res.end(imageBuffer);
        }
      }
    }
  } catch (err: any) {
    console.warn(
      '[Photo Service] Error retrieving photo:',
      err.message
    );
  }

  // 5. Final fallback
  return res.redirect(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'
  );
});

// ==========================================
// AUTH & PROFILE ENDPOINTS (MongoDB Backed)
// ==========================================

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      username,
      email,
      password,
      role,
      department,
      year,
      studentId,
      phone,
      bio,
      avatar,
      skills,
      domain,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      adminKey
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const existingEmail = await db.findUserByEmail(cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    if (cleanUsername) {
      const existingUser = await db.findUserByUsernameOrEmail(cleanUsername);
      if (existingUser && existingUser.email !== cleanEmail) {
        return res.status(400).json({ error: 'This username is already taken. Please choose another username.' });
      }
    }

    let userRole = 'MEMBER';
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'FACULTY') && (adminKey === 'admin123' || adminKey === 'EYANTRA_ADMIN_2026' || cleanEmail === 'lnjpiteyantra@gmail.com')) {
      userRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
    }

    const defaultAvatar = avatar || (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250');

    const newUser = await db.createUser({
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      password: password || 'pass123',
      name: name.trim(),
      role: userRole as any,
      department: department || 'Electronics & Communication Engineering',
      year: year || '1st Year',
      studentId: studentId || '',
      phone: phone || '',
      bio: bio || 'e-Yantra LNJPIT member passionate about robotics, embedded systems, and technological innovation.',
      avatar: defaultAvatar,
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Robotics', 'C/C++']),
      domain: domain || 'Robotics & Automation',
      githubUrl: githubUrl || '',
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await db.addAuditLog({
      user: newUser.email,
      role: newUser.role,
      action: 'USER_REGISTER',
      targetRecord: `User ID ${newUser.id} (@${newUser.username || newUser.email})`
    });

    res.json({ token, user: sanitizeUser(newUser) });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, email, username, password, requiredRole } = req.body;
    const loginKey = (identifier || username || email || '').trim().toLowerCase();

    if (!loginKey) {
      return res.status(400).json({ error: 'Username or Email is required' });
    }

    let user = await db.findUserByUsernameOrEmail(loginKey);

    // Fallback for default superadmin
    if (!user && (loginKey === 'lnjpiteyantra@gmail.com' || loginKey === 'admin')) {
      user = await db.createUser({
        id: 'usr-superadmin-01',
        username: 'admin',
        email: 'lnjpiteyantra@gmail.com',
        password: 'admin',
        name: 'e-Yantra LNJPIT Admin',
        role: 'SUPER_ADMIN',
        department: 'Electronics & Communication Engineering',
        year: 'Faculty In-Charge',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      });
    }

    // Fallback for student demo account
    if (!user && (loginKey === 'student.lead@lnjpit.ac.in' || loginKey === 'aarav')) {
      user = await db.createUser({
        id: 'usr-student-01',
        username: 'aarav',
        email: 'student.lead@lnjpit.ac.in',
        password: 'student123',
        name: 'Aarav Kumar',
        role: 'COORDINATOR',
        department: 'Electronics & Communication Engineering',
        year: '4th Year',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this username or email. Please create an account to get started.'
      });
    }

    // Verify password if user has password set and password is supplied
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    if (requiredRole === 'ADMIN' && !(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'FACULTY')) {
      return res.status(403).json({ error: 'This account does not have Admin privileges. Please use Member/Student login.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await db.addAuditLog({
      user: user.email,
      role: user.role,
      action: 'USER_LOGIN',
      targetRecord: `User ID ${user.id} (@${user.username || user.email})`
    });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.get('/auth/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const user = await db.findUserById(reqUser.id) || await db.findUserByEmail(reqUser.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update own profile (Self-service edit for authenticated users)
router.put('/auth/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const current = await db.findUserById(reqUser.id) || await db.findUserByEmail(reqUser.email);
    if (!current) return res.status(404).json({ error: 'User account not found' });

    const {
      name,
      username,
      phone,
      avatar,
      department,
      year,
      studentId,
      bio,
      skills,
      domain,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      password
    } = req.body;

    // Check username uniqueness if changed
    if (username && username.trim().toLowerCase() !== (current.username || '').toLowerCase()) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const existing = await db.findUserByUsernameOrEmail(cleanUsername);
      if (existing && existing.id !== current.id) {
        return res.status(400).json({ error: 'This username is already in use by another member.' });
      }
    }

    const updates: Partial<IUser> = {};
    if (name !== undefined) updates.name = name.trim();
    if (username !== undefined) updates.username = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;
    if (department !== undefined) updates.department = department;
    if (year !== undefined) updates.year = year;
    if (studentId !== undefined) updates.studentId = studentId;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    if (domain !== undefined) updates.domain = domain;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
    if (password) updates.password = password;

    const updated = await db.updateUser(current.id, updates);

    await db.addAuditLog({
      user: current.email,
      role: current.role,
      action: 'UPDATE_PROFILE',
      targetRecord: `Updated Profile of User ${current.id}`
    });

    res.json({ success: true, user: sanitizeUser(updated) });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile in database' });
  }
});

// Public profile endpoint
router.get('/users/public/:idOrUsername', async (req: Request, res: Response) => {
  try {
    const user = await db.findUserByIdOrUsername(req.params.idOrUsername);
    if (!user) return res.status(404).json({ error: 'Member profile not found' });
    
    // Return sanitized public profile
    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      year: user.year,
      studentId: user.studentId,
      bio: user.bio,
      skills: user.skills,
      domain: user.domain,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      portfolioUrl: user.portfolioUrl,
      status: user.status,
      joinedDate: user.joinedDate,
      createdAt: user.createdAt
    };
    res.json(publicProfile);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// ==========================================
// USERS CRUD ENDPOINTS (Admin Control)
// ==========================================

router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  const users = await db.getUsers();
  res.json(users.map(sanitizeUser));
});

router.put('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  const reqUser = (req as any).user;
  // Allow admins or the user themselves to update
  if (reqUser.role !== 'ADMIN' && reqUser.role !== 'SUPER_ADMIN' && reqUser.id !== req.params.id) {
    return res.status(403).json({ error: 'Permission denied to edit this user' });
  }
  const updated = await db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(sanitizeUser(updated));
});

router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteUser(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// FACULTY CRUD ENDPOINTS
// ==========================================

router.get('/faculty', async (req: Request, res: Response) => {
  const { publishedOnly } = req.query;
  const faculty = await db.getFaculty(publishedOnly === 'true');
  res.json(faculty);
});

router.get('/faculty/:slugOrId', async (req: Request, res: Response) => {
  const f = await db.findFacultyByIdOrSlug(req.params.slugOrId);
  if (!f) return res.status(404).json({ error: 'Faculty not found' });
  res.json(f);
});

router.post('/faculty', requireAdmin, async (req: Request, res: Response) => {
  const name = req.body.name || 'Faculty Member';
  const newMember = await db.createFaculty({
    id: `fac-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    designation: req.body.designation || 'Club_Head',
    department: req.body.department || 'Electronics & Communication Engineering',
    qualification: req.body.qualification || 'Ph.D. in Engineering',
    expertise: req.body.expertise || ['Robotics', 'Embedded Systems'],
    researchInterests: req.body.researchInterests || ['Autonomous Navigation'],
    bio: req.body.bio || '',
    email: req.body.email || 'faculty@lnjpit.ac.in',
    linkedin: req.body.linkedin || '',
    photo: req.body.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    publications: req.body.publications || [],
    mentorshipAreas: req.body.mentorshipAreas || ['Robotics'],
    isPublished: true,
    order: (await db.getFaculty()).length + 1
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_FACULTY',
    targetRecord: newMember.name
  });

  res.status(201).json(newMember);
});

router.put('/faculty/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateFaculty(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Faculty not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_FACULTY',
    targetRecord: updated.name
  });

  res.json(updated);
});

router.delete('/faculty/:id', requireAdmin, async (req: Request, res: Response) => {
  const faculty = await db.findFacultyByIdOrSlug(req.params.id);
  const deleted = await db.deleteFaculty(req.params.id);

  if (faculty) {
    await db.addAuditLog({
      user: (req as any).user.email,
      role: (req as any).user.role,
      action: 'DELETE_FACULTY',
      targetRecord: faculty.name
    });
  }

  res.json({ success: deleted });
});

// ==========================================
// STUDENT COORDINATORS CRUD ENDPOINTS
// ==========================================

router.get('/coordinators', async (req: Request, res: Response) => {
  const coords = await db.getCoordinators();
  res.json(coords);
});

router.post('/coordinators', requireAdmin, async (req: Request, res: Response) => {
  const newCoord = await db.createCoordinator({
    id: `coord-${Date.now()}`,
    name: req.body.name || 'Student Coordinator',
    position: req.body.position || 'Student Lead',
    branch: req.body.branch || 'ECE',
    year: req.body.year || '4th Year',
    photo: req.body.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    email: req.body.email || 'student@lnjpit.ac.in',
    linkedin: req.body.linkedin || '',
    github: req.body.github || '',
    bio: req.body.bio || '',
    responsibilities: req.body.responsibilities || ['Event Coordination'],
    technicalSkills: req.body.skills || req.body.technicalSkills || ['Robotics', 'C++'],
    achievements: req.body.achievements || [],
    order: (await db.getCoordinators()).length + 1
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_COORDINATOR',
    targetRecord: newCoord.name
  });

  res.status(201).json(newCoord);
});

router.put('/coordinators/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateCoordinator(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coordinator not found' });
  res.json(updated);
});

router.delete('/coordinators/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteCoordinator(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// UNIFIED TEAM MEMBERS & PROFILE MANAGEMENT
// ==========================================

// Upload photo endpoint (handles real images, validates format/size, writes to disk, returns clean URL)
router.post('/upload/photo', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required (base64 data URI or raw base64)' });
    }

    const saved = await saveUploadedPhoto(imageBase64, filename);
    res.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
      storageId: saved.storageId,
      size: saved.size,
      message: 'Photo uploaded successfully'
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to process image upload' });
  }
});

// GET all team members (public endpoint with filters)
router.get('/team-members', async (req: Request, res: Response) => {
  try {
    const { activeOnly, memberType, isPublished, search } = req.query;
    
    // Check if requester is authenticated admin requesting unpublished/inactive items
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isAdmin = false;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded && (decoded.role === 'SUPER_ADMIN' || decoded.role === 'ADMIN' || decoded.role === 'FACULTY')) {
          isAdmin = true;
        }
      } catch (e) {}
    }

    const filter: any = {};
    if (!isAdmin) {
      filter.activeOnly = true;
      filter.isPublished = true;
    } else {
      if (activeOnly === 'true') filter.activeOnly = true;
      if (isPublished === 'true') filter.isPublished = true;
    }

    if (memberType && typeof memberType === 'string' && memberType !== 'ALL') {
      filter.memberType = memberType.toUpperCase();
    }

    let members = await db.getTeamMembers(filter);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      members = members.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.skills?.some(s => s.toLowerCase().includes(q)) ||
        m.email.toLowerCase().includes(q)
      );
    }

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch team members' });
  }
});

// GET single team member by id or slug
router.get('/team-members/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const member = await db.findTeamMemberByIdOrSlug(req.params.idOrSlug);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to load team member' });
  }
});

// CREATE new team member (Protected - Super Admin / Admin / Faculty)
router.post('/team-members', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      memberType,
      designation,
      department,
      batch,
      college,
      shortBio,
      fullBiography,
      skills,
      areasOfInterest,
      projects,
      achievements,
      responsibilities,
      photo,
      imageBase64,
      photoFilename,
      email,
      phone,
      socialLinks,
      order,
      isActive,
      isFeatured,
      isPublished,
      visibility
    } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid full name is required (min 2 characters)' });
    }
    if (!designation || typeof designation !== 'string' || designation.trim().length < 2) {
      return res.status(400).json({ error: 'Designation / role title is required' });
    }
    if (!department || typeof department !== 'string') {
      return res.status(400).json({ error: 'Department is required' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const normalizedType = (memberType || 'MEMBER').toUpperCase();
    const validTypes = ['FACULTY', 'TECHNICAL_LEAD', 'COORDINATOR', 'PROJECT_LEAD', 'MEMBER', 'LAB_ASSISTANT', 'ALUMNI', 'ADVISOR', 'OTHER'];
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({ error: `Invalid memberType. Allowed: ${validTypes.join(', ')}` });
    }

    // Process photo: if base64 provided, write to disk
    let finalPhoto = photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';
    let finalStorageId = '';
    let finalFilename = photoFilename || '';

    if (imageBase64) {
      const saved = await saveUploadedPhoto(imageBase64, photoFilename || name);
      finalPhoto = saved.url;
      finalStorageId = saved.storageId;
      finalFilename = saved.filename;
    }

    // Sanitize URLs in socialLinks
    const sanitizeUrl = (url?: string) => {
      if (!url || typeof url !== 'string') return '';
      const trimmed = url.trim();
      if (!trimmed) return '';
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    };

    const cleanSocialLinks = {
      linkedin: sanitizeUrl(socialLinks?.linkedin),
      github: sanitizeUrl(socialLinks?.github),
      portfolio: sanitizeUrl(socialLinks?.portfolio),
      website: sanitizeUrl(socialLinks?.website),
      googleScholar: sanitizeUrl(socialLinks?.googleScholar),
      researchGate: sanitizeUrl(socialLinks?.researchGate),
      other: sanitizeUrl(socialLinks?.other)
    };

    const newMember = await db.createTeamMember({
      name: name.trim(),
      slug: slug ? slug.trim() : undefined,
      memberType: normalizedType,
      designation: designation.trim(),
      department: department.trim(),
      batch: batch?.trim() || 'Batch 2023-27',
      college: college?.trim() || 'Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra',
      shortBio: shortBio?.trim() || '',
      fullBiography: fullBiography?.trim() || shortBio?.trim() || '',
      skills: Array.isArray(skills) ? skills.map(s => String(s).trim()).filter(Boolean) : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest.map(a => String(a).trim()).filter(Boolean) : (typeof areasOfInterest === 'string' ? areasOfInterest.split(',').map(a => a.trim()).filter(Boolean) : []),
      projects: Array.isArray(projects) ? projects.map(p => String(p).trim()).filter(Boolean) : (typeof projects === 'string' ? projects.split(',').map(p => p.trim()).filter(Boolean) : []),
      achievements: Array.isArray(achievements) ? achievements.map(a => String(a).trim()).filter(Boolean) : (typeof achievements === 'string' ? achievements.split(',').map(a => a.trim()).filter(Boolean) : []),
      responsibilities: Array.isArray(responsibilities) ? responsibilities.map(r => String(r).trim()).filter(Boolean) : (typeof responsibilities === 'string' ? responsibilities.split(',').map(r => r.trim()).filter(Boolean) : []),
      photo: finalPhoto,
      photoStorageId: finalStorageId,
      photoFilename: finalFilename,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      socialLinks: cleanSocialLinks,
      order: typeof order === 'number' ? order : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      visibility: visibility || 'PUBLIC'
    });

    // Also sync to legacy models if appropriate so other existing views work flawlessly
    try {
      if (normalizedType === 'FACULTY') {
        await db.createFaculty({
          id: `fac-${Date.now()}`,
          name: newMember.name,
          designation: newMember.designation,
          department: newMember.department,
          email: newMember.email,
          photo: newMember.photo,
          bio: newMember.shortBio || newMember.fullBiography,
          expertise: newMember.skills,
          researchInterests: newMember.areasOfInterest,
          publications: newMember.achievements,
          order: newMember.order
        });
      } else if (normalizedType === 'TECHNICAL_LEAD') {
        await db.createTechnicalLead({
          id: `tech-${Date.now()}`,
          name: newMember.name,
          domain: (newMember.areasOfInterest[0] || 'Robotics') as any,
          domainBadge: newMember.department,
          position: newMember.designation,
          branch: newMember.department,
          year: newMember.batch || '3rd Year',
          photo: newMember.photo,
          email: newMember.email,
          linkedin: newMember.socialLinks.linkedin,
          github: newMember.socialLinks.github,
          bio: newMember.shortBio || newMember.fullBiography,
          technicalSkills: newMember.skills,
          projectsLed: newMember.projects,
          order: newMember.order
        });
      } else if (normalizedType === 'COORDINATOR') {
        await db.createCoordinator({
          id: `coord-${Date.now()}`,
          name: newMember.name,
          position: newMember.designation,
          branch: newMember.department,
          year: newMember.batch || '4th Year',
          bio: newMember.shortBio || newMember.fullBiography,
          linkedin: newMember.socialLinks.linkedin,
          github: newMember.socialLinks.github,
          email: newMember.email,
          photo: newMember.photo,
          responsibilities: newMember.responsibilities,
          technicalSkills: newMember.skills,
          order: newMember.order
        });
      }
    } catch (syncErr: any) {
      console.warn('[Sync Note]', syncErr.message);
    }

    // Record Audit Log
    const user = (req as any).user;
    await db.addAuditLog({
      user: user?.email || 'admin@lnjpit.ac.in',
      role: user?.role || 'ADMIN',
      action: 'CREATE_TEAM_MEMBER',
      targetRecord: `${newMember.name} (${newMember.designation})`,
      details: {
        id: newMember.id,
        memberType: newMember.memberType,
        email: newMember.email
      }
    });

    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create team member' });
  }
});

// UPDATE team member (Protected - Super Admin / Admin / Faculty)
router.put('/team-members/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.findTeamMemberByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const updates = { ...req.body };

    // If new imageBase64 is passed, save and clean up previous file
    if (updates.imageBase64) {
      const saved = await saveUploadedPhoto(updates.imageBase64, updates.photoFilename || existing.name);
      if (existing.photo && (existing.photo.startsWith('/api/photos/') || existing.photo.startsWith('/uploads/team/'))) {
        await deleteLocalPhoto(existing.photo);
      }
      updates.photo = saved.url;
      updates.photoStorageId = saved.storageId;
      updates.photoFilename = saved.filename;
      delete updates.imageBase64;
    }

    // Sanitize URLs in socialLinks if provided
    if (updates.socialLinks) {
      const sanitizeUrl = (url?: string) => {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim();
        if (!trimmed) return '';
        if (!/^https?:\/\//i.test(trimmed)) {
          return `https://${trimmed}`;
        }
        return trimmed;
      };

      updates.socialLinks = {
        linkedin: sanitizeUrl(updates.socialLinks.linkedin),
        github: sanitizeUrl(updates.socialLinks.github),
        portfolio: sanitizeUrl(updates.socialLinks.portfolio),
        website: sanitizeUrl(updates.socialLinks.website),
        googleScholar: sanitizeUrl(updates.socialLinks.googleScholar),
        researchGate: sanitizeUrl(updates.socialLinks.researchGate),
        other: sanitizeUrl(updates.socialLinks.other)
      };
    }

    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updates.areasOfInterest && typeof updates.areasOfInterest === 'string') {
      updates.areasOfInterest = updates.areasOfInterest.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    if (updates.projects && typeof updates.projects === 'string') {
      updates.projects = updates.projects.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
    if (updates.achievements && typeof updates.achievements === 'string') {
      updates.achievements = updates.achievements.split(',').map((a: string) => a.trim()).filter(Boolean);
    }
    if (updates.responsibilities && typeof updates.responsibilities === 'string') {
      updates.responsibilities = updates.responsibilities.split(',').map((r: string) => r.trim()).filter(Boolean);
    }

    const updated = await db.updateTeamMember(existing.id, updates);

    // Record Audit Log
    const user = (req as any).user;
    await db.addAuditLog({
      user: user?.email || 'admin@lnjpit.ac.in',
      role: user?.role || 'ADMIN',
      action: 'UPDATE_TEAM_MEMBER',
      targetRecord: `${updated?.name || existing.name}`,
      details: {
        id: existing.id,
        updatedFields: Object.keys(updates)
      }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update team member' });
  }
});

// UPLOAD / REPLACE PHOTO FOR SPECIFIC TEAM MEMBER
router.post('/team-members/:id/photo', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const existing = await db.findTeamMemberByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const saved = await saveUploadedPhoto(imageBase64, filename || existing.name);
    
    // Clean up old photo
    if (existing.photo && (existing.photo.startsWith('/api/photos/') || existing.photo.startsWith('/uploads/team/'))) {
      await deleteLocalPhoto(existing.photo);
    }

    const updated = await db.updateTeamMember(existing.id, {
      photo: saved.url,
      photoStorageId: saved.storageId,
      photoFilename: saved.filename
    });

    // Record Audit Log
    const user = (req as any).user;
    await db.addAuditLog({
      user: user?.email || 'admin@lnjpit.ac.in',
      role: user?.role || 'ADMIN',
      action: 'UPDATE_TEAM_MEMBER_PHOTO',
      targetRecord: `${existing.name}`,
      details: {
        id: existing.id,
        photoUrl: saved.url
      }
    });

    res.json({
      success: true,
      photoUrl: saved.url,
      storageId: saved.storageId,
      member: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to upload photo' });
  }
});

// TOGGLE ACTIVE / INACTIVE STATUS
router.patch('/team-members/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive boolean is required' });
    }

    const existing = await db.findTeamMemberByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const updated = await db.toggleTeamMemberStatus(existing.id, Boolean(isActive));

    const user = (req as any).user;
    await db.addAuditLog({
      user: user?.email || 'admin@lnjpit.ac.in',
      role: user?.role || 'ADMIN',
      action: isActive ? 'REACTIVATE_TEAM_MEMBER' : 'DEACTIVATE_TEAM_MEMBER',
      targetRecord: `${existing.name} (${existing.designation})`,
      details: { id: existing.id, isActive: Boolean(isActive) }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update status' });
  }
});

// DELETE team member (Protected - Super Admin / Admin / Faculty)
router.delete('/team-members/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await db.findTeamMemberByIdOrSlug(id);
    
    // If not found in unified model, check legacy models to get metadata for cleanup
    if (!existing) {
      const fac = await db.findFacultyByIdOrSlug(id);
      if (fac) {
        existing = {
          id: fac.id,
          name: fac.name,
          slug: fac.slug,
          designation: fac.designation,
          department: fac.department,
          photo: fac.photo,
          email: fac.email,
          memberType: 'FACULTY' as any
        } as any;
      } else {
        const coord = await db.findCoordinatorById(id);
        if (coord) {
          existing = {
            id: coord.id,
            name: coord.name,
            designation: coord.position,
            photo: coord.photo,
            email: coord.email,
            memberType: 'COORDINATOR' as any
          } as any;
        } else {
          const lead = await db.findTechnicalLeadById(id);
          if (lead) {
            existing = {
              id: lead.id,
              name: lead.name,
              designation: lead.position,
              photo: lead.photo,
              email: lead.email,
              memberType: 'TECHNICAL_LEAD' as any
            } as any;
          }
        }
      }
    }

    if (existing) {
      // Clean up photo from storage (both local disk and MongoDB StoredPhoto)
      const photoTargets = [
        existing.photo,
        existing.photoFilename,
        existing.photoStorageId,
        existing.profilePhoto?.url,
        existing.profilePhoto?.filename,
        existing.profilePhoto?.publicId
      ].filter(Boolean) as string[];

      for (const target of photoTargets) {
        try {
          await deleteLocalPhoto(target);
          await db.deleteStoredPhoto(target);
        } catch (e) {
          // Ignore individual photo cleanup errors
        }
      }
    }

    const deleted = await db.deleteTeamMember(existing?.id || id);

    const user = (req as any).user;
    await db.addAuditLog({
      user: user?.email || 'admin@lnjpit.ac.in',
      role: user?.role || 'ADMIN',
      action: 'DELETE_TEAM_MEMBER',
      targetRecord: existing ? `${existing.name || id} (${existing.designation || 'Member'})` : `Member ID: ${id}`,
      details: { id: existing?.id || id, memberType: existing?.memberType }
    });

    res.json({ success: true, message: `Team member ${existing?.name || id} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete team member' });
  }
});

// ==========================================
// TECHNICAL LEADS CRUD ENDPOINTS
// ==========================================

router.get('/technical-leads', async (req: Request, res: Response) => {
  const leads = await db.getTechnicalLeads();
  res.json(leads);
});

router.post('/technical-leads', requireAdmin, async (req: Request, res: Response) => {
  const newLead = await db.createTechnicalLead({
    id: `tech-${Date.now()}`,
    name: req.body.name || 'Technical Lead',
    domain: req.body.domain || 'Robotics',
    domainBadge: req.body.domainBadge || 'Autonomous Systems',
    position: req.body.position || 'Domain Lead',
    branch: req.body.branch || 'ECE',
    year: req.body.year || '3rd Year',
    photo: req.body.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    email: req.body.email || 'lead@lnjpit.ac.in',
    linkedin: req.body.linkedin || '',
    github: req.body.github || '',
    bio: req.body.bio || '',
    technicalSkills: req.body.skills || req.body.technicalSkills || ['Python', 'C++'],
    projectsLed: req.body.projectsLed || []
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_TECH_LEAD',
    targetRecord: newLead.name
  });

  res.status(201).json(newLead);
});

router.put('/technical-leads/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateTechnicalLead(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Technical lead not found' });
  res.json(updated);
});

router.delete('/technical-leads/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteTechnicalLead(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// MEMBERS CRUD ENDPOINTS
// ==========================================

router.get('/members', async (req: Request, res: Response) => {
  const members = await db.getMembers();
  res.json(members);
});

router.post('/members', requireAdmin, async (req: Request, res: Response) => {
  const newMember = await db.createMember({
    id: `mem-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    rollNo: req.body.rollNo || '',
    branch: req.body.branch || 'ECE',
    year: req.body.year || '1st Year',
    domain: req.body.domain || 'Robotics',
    role: req.body.role || 'Member',
    status: req.body.status || 'Active',
    joinedDate: req.body.joinedDate || new Date().toISOString().split('T')[0],
    skills: req.body.skills || []
  });
  res.status(201).json(newMember);
});

router.put('/members/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Member not found' });
  res.json(updated);
});

router.delete('/members/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteMember(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// PROJECTS CRUD ENDPOINTS
// ==========================================

router.get('/projects', async (req: Request, res: Response) => {
  const { category, status, search } = req.query;
  const filter: Record<string, any> = {};

  if (category) filter.category = new RegExp(String(category), 'i');
  if (status) filter.status = new RegExp(String(status), 'i');
  if (search) {
    const q = new RegExp(String(search), 'i');
    filter.$or = [{ title: q }, { shortDescription: q }, { tags: q }];
  }

  const projects = await db.getProjects(filter);
  res.json(projects);
});

router.get('/projects/:slugOrId', async (req: Request, res: Response) => {
  const project = await db.findProjectByIdOrSlug(req.params.slugOrId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/projects', requireAdmin, async (req: Request, res: Response) => {
  const title = req.body.title || 'New Technology Project';
  const newProject = await db.createProject({
    id: `prj-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: req.body.shortDescription || 'Robotics and engineering research project at LNJPIT.',
    problemStatement: req.body.problemStatement || '',
    methodology: req.body.methodology || '',
    category: req.body.category || 'Robotics & Kinematics',
    hardwareComponents: req.body.hardwareComponents || req.body.hardware || ['ESP32', 'Sensors'],
    softwareStack: req.body.softwareStack || req.body.technologies || ['C++', 'Python'],
    results: req.body.results || '',
    futureScope: req.body.futureScope || '',
    year: req.body.year || '2026',
    status: req.body.status || 'Development',
    coverImage: req.body.coverImage || req.body.image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    gallery: req.body.gallery || [],
    leadName: req.body.leadName || req.body.projectLead || 'e-Yantra Student Team',
    teamMembers: req.body.teamMembers || [],
    guideName: req.body.guideName || req.body.facultyMentor || 'Dr. R. K. Sharma',
    githubUrl: req.body.githubUrl || '',
    liveDemoUrl: req.body.liveDemoUrl || '',
    isFeatured: req.body.isFeatured || false,
    tags: req.body.tags || ['Robotics', 'LNJPIT']
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_PROJECT',
    targetRecord: newProject.title
  });

  res.status(201).json(newProject);
});

router.put('/projects/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_PROJECT',
    targetRecord: updated.title
  });

  res.json(updated);
});

router.delete('/projects/:id', requireAdmin, async (req: Request, res: Response) => {
  const project = await db.findProjectByIdOrSlug(req.params.id);
  const deleted = await db.deleteProject(req.params.id);

  if (project) {
    await db.addAuditLog({
      user: (req as any).user.email,
      role: (req as any).user.role,
      action: 'DELETE_PROJECT',
      targetRecord: project.title
    });
  }

  res.json({ success: deleted });
});

// Member project submission route
router.post('/projects/submit', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const title = req.body.title || 'Student Innovation Proposal';

  const newProject = await db.createProject({
    id: `prj-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: req.body.shortDescription || 'Proposed project by LNJPIT student.',
    problemStatement: req.body.problemStatement || '',
    methodology: req.body.methodology || '',
    category: req.body.category || 'Robotics & Kinematics',
    hardwareComponents: req.body.hardwareComponents || [],
    softwareStack: req.body.softwareStack || req.body.technologies || [],
    year: new Date().getFullYear().toString(),
    status: 'Under Review',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    leadName: user.name,
    teamMembers: [{ name: user.name, roll: user.studentId || '', role: 'Project Lead' }],
    githubUrl: req.body.githubUrl || '',
    isFeatured: false,
    tags: req.body.technologies || ['Student Project']
  });

  await db.addAuditLog({
    user: user.email,
    role: user.role,
    action: 'MEMBER_SUBMIT_PROJECT',
    targetRecord: newProject.title
  });

  res.status(201).json({ message: 'Project submitted successfully for review!', project: newProject });
});

// ==========================================
// EVENTS & REGISTRATIONS CRUD ENDPOINTS
// ==========================================

router.get('/events', async (req: Request, res: Response) => {
  const events = await db.getEvents();
  res.json(events);
});

router.get('/events/:slugOrId', async (req: Request, res: Response) => {
  const event = await db.findEventByIdOrSlug(req.params.slugOrId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/events', requireAdmin, async (req: Request, res: Response) => {
  const title = req.body.title || 'Technical Workshop';
  const newEvent = await db.createEvent({
    id: `evt-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: req.body.description || req.body.shortDescription || 'Technical event at e-Yantra LNJPIT.',
    description: req.body.fullDetails || req.body.description || '',
    category: req.body.category || 'Workshop',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || `${req.body.startTime || '10:00 AM'} - ${req.body.endTime || '04:00 PM'}`,
    venue: req.body.venue || 'e-Yantra Robotics Lab, LNJPIT Chapra',
    bannerImage: req.body.poster || req.body.bannerImage || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    registrationOpen: true,
    registrationDeadline: req.body.registrationDeadline || req.body.date,
    capacity: Number(req.body.capacity) || 100,
    registeredCount: 0,
    prerequisites: req.body.prerequisites || [],
    agenda: req.body.agenda || [],
    speakers: req.body.speakers || [{ name: req.body.speaker || 'e-Yantra Faculty & Leads', designation: 'Mentors', org: 'LNJPIT Chapra' }],
    prizePool: req.body.prizePool || ''
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_EVENT',
    targetRecord: newEvent.title
  });

  res.status(201).json(newEvent);
});

router.put('/events/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateEvent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Event not found' });
  res.json(updated);
});

router.delete('/events/:id', requireAdmin, async (req: Request, res: Response) => {
  const event = await db.findEventByIdOrSlug(req.params.id);
  const deleted = await db.deleteEvent(req.params.id);

  if (event) {
    await db.addAuditLog({
      user: (req as any).user.email,
      role: (req as any).user.role,
      action: 'DELETE_EVENT',
      targetRecord: event.title
    });
  }

  res.json({ success: deleted });
});

// Event Registration (Requires Authentication)
router.post('/events/:id/register', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const authUserId = authUser?.id || authUser?._id || authUser?.sub;
    if (!authUserId) {
      return res.status(401).json({ error: 'Authentication required. Please sign in to register for events.' });
    }

    const event = await db.findEventByIdOrSlug(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.registrationOpen) {
      return res.status(400).json({ error: 'Registrations are currently closed for this event.' });
    }

    const { name, fullName, email, phone, college, department, branch, year, rollNumber, rollNo, experienceLevel, teamName, teamMembers, customFormResponses } = req.body;
    const registrantName = (fullName || name || authUser.name || '').trim();
    const cleanEmail = (email || authUser.email || '').trim().toLowerCase();
    const cleanPhone = (phone || authUser.phone || '').trim();

    if (!registrantName || !cleanEmail || !cleanPhone) {
      return res.status(400).json({ error: 'Full name, email address, and phone number are required.' });
    }

    // Duplicate Check by email or userId
    const existing = (await db.findEventRegistration(event.id, cleanEmail)) || (await db.findEventRegistrationByUserId(event.id, authUserId));
    if (existing) {
      return res.status(400).json({ error: 'You have already registered for this event.' });
    }

    // Capacity Check
    const isWaitlist = event.capacity && (event.registeredCount || 0) >= event.capacity;
    const initialStatus = isWaitlist ? 'WAITLISTED' : 'REGISTERED';

    const newReg = await db.createEventRegistration({
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      registrationId: `EY-EVT-${Date.now().toString(36).toUpperCase()}`,
      eventId: event.id,
      eventTitle: event.title,
      userId: authUserId,
      fullName: registrantName,
      name: registrantName,
      email: cleanEmail,
      phone: cleanPhone,
      college: college || authUser.college || 'LNJPIT Chapra',
      rollNo: rollNumber || rollNo || authUser.studentId || '',
      rollNumber: rollNumber || rollNo || authUser.studentId || '',
      branch: department || branch || authUser.department || 'ECE',
      department: department || branch || authUser.department || 'Electronics & Communication Engineering',
      year: year || authUser.year || '3rd Year',
      teamName: teamName || '',
      teamMembers: teamMembers || [],
      experienceLevel: experienceLevel || 'Beginner',
      customFormResponses: customFormResponses || {},
      status: initialStatus,
      attendance: 'PENDING',
      registeredAt: new Date().toISOString()
    });

    // Create Notification for Admins in MongoDB
    await db.createNotification({
      title: `New Event Registration: ${event.title}`,
      message: `${registrantName} (${cleanEmail}) registered for ${event.title}. Status: ${initialStatus}`,
      type: isWaitlist ? 'warning' : 'success',
      targetRole: 'ADMIN',
      link: '/admin'
    });

    // Create Notification for Participant
    await db.createNotification({
      title: `Registration Confirmed: ${event.title}`,
      message: `Your registration ID is ${newReg.registrationId}. Venue: ${event.venue}, Date: ${event.date}`,
      type: 'success',
      targetUser: cleanEmail,
      recipientEmail: cleanEmail,
      recipientUserId: authUserId,
      link: `/events/${event.slug || event.id}`
    });

    // Security & Compliance Audit Log
    await db.addAuditLog({
      user: authUser.email || cleanEmail,
      userId: authUserId,
      role: authUser.role || 'STUDENT',
      action: 'EVENT_REGISTRATION',
      targetRecord: `${event.title} (${newReg.registrationId})`,
      details: {
        registrationId: newReg.registrationId,
        userId: authUserId,
        name: registrantName,
        email: cleanEmail,
        status: initialStatus
      }
    });

    res.status(201).json({
      message: isWaitlist
        ? 'Event is currently at full capacity. You have been placed on the priority waitlist!'
        : 'Registration confirmed successfully!',
      registration: newReg
    });
  } catch (err: any) {
    console.error('Registration processing error:', err);
    res.status(500).json({ error: 'Failed to process event registration' });
  }
});

router.get('/events/:id/registrations', requireAdmin, async (req: Request, res: Response) => {
  const registrations = await db.getEventRegistrations({ eventId: req.params.id });
  res.json(registrations);
});

router.get('/registrations', requireAdmin, async (req: Request, res: Response) => {
  const { eventId, status, attendance, search } = req.query;
  const filter: Record<string, any> = {};
  if (eventId) filter.eventId = String(eventId);
  if (status) filter.status = String(status);
  if (attendance) filter.attendance = String(attendance);
  if (search) {
    const q = new RegExp(String(search), 'i');
    filter.$or = [{ fullName: q }, { email: q }, { phone: q }, { registrationId: q }];
  }

  const registrations = await db.getEventRegistrations(filter);
  res.json(registrations);
});

router.put('/registrations/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const updated = await db.updateEventRegistration(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Registration not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: `UPDATE_REGISTRATION_STATUS_${String(status).toUpperCase()}`,
    targetRecord: `${updated.fullName} - ${updated.eventTitle}`
  });

  res.json(updated);
});

router.put('/registrations/:id/attendance', requireAdmin, async (req: Request, res: Response) => {
  const { attendance } = req.body;
  if (!attendance) return res.status(400).json({ error: 'Attendance status is required' });

  const updated = await db.updateEventRegistration(req.params.id, { attendance });
  if (!updated) return res.status(404).json({ error: 'Registration not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: `MARK_ATTENDANCE_${String(attendance).toUpperCase()}`,
    targetRecord: `${updated.fullName} - ${updated.eventTitle}`
  });

  res.json(updated);
});

router.delete('/registrations/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteEventRegistration(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Registration not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CANCEL_EVENT_REGISTRATION',
    targetRecord: `Registration ID: ${req.params.id}`
  });

  res.json({ success: true, message: 'Registration removed successfully' });
});

// ==========================================
// USER & ROLE MANAGEMENT (Admin Only)
// ==========================================

router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  const users = await db.getUsers();
  const sanitized = users.map(u => {
    const { password, ...rest } = u as any;
    return rest;
  });
  res.json(sanitized);
});

router.put('/users/:id/role', requireAdmin, async (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles = [
    'SUPER_ADMIN', 'ADMIN', 'FACULTY', 'TECHNICAL_HEAD', 
    'TECHNICAL_LEAD', 'COORDINATOR', 'PROJECT_LEAD', 'MEMBER', 'STUDENT', 'APPLICANT'
  ];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  const updated = await db.updateUser(req.params.id, { role });
  if (!updated) return res.status(404).json({ error: 'User not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_USER_ROLE',
    targetRecord: `${updated.email} -> ${role}`
  });

  const { password, ...safeUser } = updated as any;
  res.json(safeUser);
});

router.put('/users/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = await db.updateUser(req.params.id, { status: status || 'Active' });
  if (!updated) return res.status(404).json({ error: 'User not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_USER_STATUS',
    targetRecord: `${updated.email} -> ${status}`
  });

  const { password, ...safeUser } = updated as any;
  res.json(safeUser);
});

router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  const userToDelete = await db.findUserById(req.params.id);
  if (!userToDelete) return res.status(404).json({ error: 'User not found' });

  if (userToDelete.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Cannot delete Super Admin account' });
  }

  const deleted = await db.deleteUser(req.params.id);
  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'DELETE_USER',
    targetRecord: userToDelete.email
  });

  res.json({ success: deleted });
});

// ==========================================
// COMMUNITY JOIN APPLICATIONS CRUD ENDPOINTS
// ==========================================

router.post('/join', async (req: Request, res: Response) => {
  const { fullName, email, phone, rollNumber, department, year, cgpa, domains, technicalSkills, pastProjects, githubUrl, linkedinUrl, portfolioUrl, whyJoin, hoursPerWeek, hardwareExperience } = req.body;

  if (!fullName || !email || !phone || !department || !whyJoin) {
    return res.status(400).json({ error: 'Please fill in all required application fields.' });
  }

  const newApp = await db.createApplication({
    id: `app-${Date.now()}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    rollNumber: rollNumber || '',
    department: department || 'ECE',
    year: year || '1st Year',
    cgpa: cgpa || '',
    domains: Array.isArray(domains) ? domains : [domains],
    technicalSkills: Array.isArray(technicalSkills) ? technicalSkills : [technicalSkills],
    pastProjects: pastProjects || '',
    githubUrl: githubUrl || '',
    linkedinUrl: linkedinUrl || '',
    portfolioUrl: portfolioUrl || '',
    whyJoin,
    hoursPerWeek: hoursPerWeek || '10-15 hours',
    hardwareExperience: hardwareExperience || 'Beginner',
    status: 'Pending',
    submittedAt: new Date().toISOString()
  });

  // Admin Notification
  await db.createNotification({
    title: 'New Community Join Application',
    message: `${fullName} (${department}, ${year}) applied to join e-Yantra.`,
    type: 'info',
    targetRole: 'ADMIN',
    link: '/admin'
  });

  // Applicant Notification
  await db.createNotification({
    title: 'Application Received: e-Yantra LNJPIT',
    message: 'Thank you for applying to e-Yantra! The core team will review your application soon.',
    type: 'success',
    targetUser: email.trim().toLowerCase(),
    recipientEmail: email.trim().toLowerCase()
  });

  // Audit Log
  await db.addAuditLog({
    user: email.trim().toLowerCase(),
    role: 'APPLICANT',
    action: 'SUBMIT_JOIN_APPLICATION',
    targetRecord: fullName.trim(),
    details: { email, department, year, domains }
  });

  res.status(201).json({ message: 'Join application submitted successfully!', application: newApp });
});

router.get('/applications', requireAdmin, async (req: Request, res: Response) => {
  const apps = await db.getApplications();
  res.json(apps);
});

router.put('/applications/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status, reviewNotes, reviewerNotes } = req.body;
  const updated = await db.updateApplication(req.params.id, {
    status,
    reviewNotes: reviewNotes || reviewerNotes || '',
    reviewedAt: new Date().toISOString(),
    reviewedBy: (req as any).user?.email
  });

  if (!updated) return res.status(404).json({ error: 'Application not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: `APPLICATION_${String(status).toUpperCase()}`,
    targetRecord: updated.fullName
  });

  res.json(updated);
});

router.delete('/applications/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteApplication(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// BLOG POSTS CRUD ENDPOINTS
// ==========================================

router.get('/blog', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: Record<string, any> = {};

  if (category) filter.category = new RegExp(String(category), 'i');
  if (search) {
    const q = new RegExp(String(search), 'i');
    filter.$or = [{ title: q }, { content: q }, { tags: q }];
  }

  const posts = await db.getBlogPosts(filter);
  res.json(posts);
});

router.get('/blog/:slugOrId', async (req: Request, res: Response) => {
  const post = await db.findBlogPostByIdOrSlug(req.params.slugOrId);
  if (!post) return res.status(404).json({ error: 'Article not found' });

  await db.incrementBlogViews(req.params.slugOrId);
  res.json(post);
});

router.post('/blog', requireAdmin, async (req: Request, res: Response) => {
  const title = req.body.title || 'e-Yantra Update';
  const newPost = await db.createBlogPost({
    id: `blog-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    coverImage: req.body.coverImage || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    author: req.body.author || 'e-Yantra LNJPIT Team',
    authorRole: req.body.authorRole || 'Robotics Core Team',
    category: req.body.category || 'Announcements',
    tags: req.body.tags || ['Robotics', 'LNJPIT'],
    publishDate: new Date().toISOString().split('T')[0],
    readTime: req.body.readTime || '5 min read',
    isFeatured: req.body.isFeatured || false,
    views: 0
  });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'CREATE_BLOG_POST',
    targetRecord: newPost.title
  });

  res.status(201).json(newPost);
});

router.put('/blog/:id', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateBlogPost(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Article not found' });
  res.json(updated);
});

router.delete('/blog/:id', requireAdmin, async (req: Request, res: Response) => {
  const post = await db.findBlogPostByIdOrSlug(req.params.id);
  const deleted = await db.deleteBlogPost(req.params.id);

  if (post) {
    await db.addAuditLog({
      user: (req as any).user.email,
      role: (req as any).user.role,
      action: 'DELETE_BLOG_POST',
      targetRecord: post.title
    });
  }

  res.json({ success: deleted });
});

// ==========================================
// GALLERY, RESOURCES, ACHIEVEMENTS, CONTACT
// ==========================================

router.get('/gallery', async (req: Request, res: Response) => {
  const gallery = await db.getGallery();
  res.json(gallery);
});

router.post('/gallery', requireAdmin, async (req: Request, res: Response) => {
  const newItem = await db.createGalleryItem({
    id: `gal-${Date.now()}`,
    title: req.body.title || 'Lab Activity',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    category: req.body.category || 'Events',
    description: req.body.caption || req.body.description || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    tags: req.body.tags || ['e-Yantra']
  });
  res.status(201).json(newItem);
});

router.delete('/gallery/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteGalleryItem(req.params.id);
  res.json({ success: deleted });
});

router.get('/resources', async (req: Request, res: Response) => {
  const resources = await db.getResources();
  res.json(resources);
});

router.post('/resources', requireAdmin, async (req: Request, res: Response) => {
  const newRes = await db.createResource({
    id: `res-${Date.now()}`,
    title: req.body.title || 'Learning Resource',
    category: req.body.category || 'ROS 2',
    description: req.body.description || '',
    difficulty: req.body.difficulty || 'Beginner',
    link: req.body.link || req.body.linkUrl || '',
    type: req.body.type || 'Documentation',
    tags: req.body.tags || ['Robotics']
  });
  res.status(201).json(newRes);
});

router.delete('/resources/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteResource(req.params.id);
  res.json({ success: deleted });
});

router.get('/achievements', async (req: Request, res: Response) => {
  const achievements = await db.getAchievements();
  res.json(achievements);
});

router.post('/achievements', requireAdmin, async (req: Request, res: Response) => {
  const newAch = await db.createAchievement({
    id: `ach-${Date.now()}`,
    title: req.body.title,
    competition: req.body.competition || 'e-Yantra Robotics Competition',
    organizer: req.body.organizer || 'IIT Bombay',
    date: req.body.date || '2026',
    rank: req.body.rank || '1st Place',
    teamMembers: req.body.teamMembers || [],
    description: req.body.description || '',
    photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&q=80&w=800'
  });
  res.status(201).json(newAch);
});

router.delete('/achievements/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteAchievement(req.params.id);
  res.json({ success: deleted });
});

router.post('/contact', async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newMsg = await db.createContactMessage({
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message: message.trim(),
    status: 'Unread'
  });

  // Admin Notification
  await db.createNotification({
    title: `New Message: ${subject || 'General Inquiry'}`,
    message: `From ${name.trim()} (${email.trim()}): "${message.trim().substring(0, 80)}..."`,
    type: 'info',
    targetRole: 'ADMIN',
    link: '/admin'
  });

  // Audit Log
  await db.addAuditLog({
    user: email.trim().toLowerCase(),
    role: 'GUEST',
    action: 'SUBMIT_CONTACT_MESSAGE',
    targetRecord: subject || 'General Inquiry',
    details: { name, email, phone }
  });

  res.status(201).json({ message: 'Thank you! Your message has been received.', messageRecord: newMsg });
});

router.get('/contact', requireAdmin, async (req: Request, res: Response) => {
  const messages = await db.getContactMessages();
  res.json(messages);
});

router.put('/contact/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateContactMessage(req.params.id, { status: req.body.status });
  if (!updated) return res.status(404).json({ error: 'Message not found' });

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_CONTACT_STATUS',
    targetRecord: `Message ${req.params.id} -> ${req.body.status}`
  });

  res.json(updated);
});

router.delete('/contact/:id', requireAdmin, async (req: Request, res: Response) => {
  const deleted = await db.deleteContactMessage(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// NOTIFICATIONS CRUD ENDPOINTS
// ==========================================

router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifications = await db.getNotifications({
    $or: [
      { recipientEmail: user.email },
      { recipientUserId: user.id },
      { targetUser: user.email },
      { targetRole: user.role },
      { targetRole: 'ALL' },
      { recipientRole: user.role },
      { targetRole: { $exists: false } }
    ]
  });
  res.json(notifications);
});

router.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
  const updated = await db.markNotificationRead(req.params.id);
  res.json(updated);
});

router.put('/notifications/read-all', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifs = await db.getNotifications();
  for (const n of notifs) {
    if (n.targetRole === 'ALL' || n.targetRole === user.role || n.targetUser === user.email || (n as any).recipientEmail === user.email) {
      await db.markNotificationRead(n.id);
    }
  }
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// SEARCH, AUDIT, ANALYTICS, & SETTINGS
// ==========================================

router.get('/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ projects: [], events: [], faculty: [], blog: [], resources: [] });

  const [projects, events, faculty, blog, resources] = await Promise.all([
    db.getProjects({ $or: [{ title: new RegExp(q, 'i') }, { shortDescription: new RegExp(q, 'i') }] }),
    db.getEvents({ $or: [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }] }),
    db.getFaculty(),
    db.getBlogPosts({ $or: [{ title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') }] }),
    db.getResources({ $or: [{ title: new RegExp(q, 'i') }, { tags: new RegExp(q, 'i') }] })
  ]);

  const matchedFaculty = faculty.filter(f => f.name.toLowerCase().includes(q) || f.expertise.some(e => e.toLowerCase().includes(q)));

  res.json({ projects, events, faculty: matchedFaculty, blog, resources });
});

router.get('/audit-logs', requireAdmin, async (req: Request, res: Response) => {
  const logs = await db.getAuditLogs();
  res.json(logs);
});

router.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  const [users, projects, events, registrations, applications, blogPosts, messages] = await Promise.all([
    db.getUsers(),
    db.getProjects(),
    db.getEvents(),
    db.getEventRegistrations(),
    db.getApplications(),
    db.getBlogPosts(),
    db.getContactMessages()
  ]);

  res.json({
    totalUsers: users.length,
    totalProjects: projects.length,
    totalEvents: events.length,
    totalRegistrations: registrations.length,
    totalApplications: applications.length,
    totalBlogPosts: blogPosts.length,
    unreadMessages: messages.filter(m => m.status === 'Unread').length,
    pendingApplications: applications.filter(a => a.status === 'Pending').length
  });
});

router.get('/settings', async (req: Request, res: Response) => {
  const settings = await db.getSettings();
  const faqs = await db.getFAQs();
  const testimonials = await db.getTestimonials();

  res.json({ settings, faqs, testimonials });
});

router.put('/settings', requireAdmin, async (req: Request, res: Response) => {
  const updated = await db.updateSettings(req.body);

  await db.addAuditLog({
    user: (req as any).user.email,
    role: (req as any).user.role,
    action: 'UPDATE_SETTINGS',
    targetRecord: 'Site Settings & Notice Banner'
  });

  res.json(updated);
});

// ==========================================
// AI FEATURES ("Ask e-Yantra" & AI Project Assistant)
// ==========================================

router.post('/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const ai = getGeminiClient();

    const [faculty, coords, projects, events] = await Promise.all([
      db.getFaculty(true),
      db.getCoordinators(),
      db.getProjects(),
      db.getEvents()
    ]);

    const context = `
Organization: e-Yantra LNJPIT
Institute: Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra, Bihar, India
Official Email: lnjpiteyantra@gmail.com
Address: LNJPIT Campus, Chapra, Saran, Bihar - 841302

Faculty Mentors: ${faculty.map(f => `${f.name} (${f.designation}, ${f.department})`).join('; ')}
Student Coordinators: ${coords.map(c => `${c.name} (${c.position})`).join('; ')}
Active Projects: ${projects.map(p => `${p.title} [Status: ${p.status}, Category: ${p.category}]`).join('; ')}
Upcoming Events: ${events.map(e => `${e.title} [Date: ${e.date}]`).join('; ')}
    `;

    if (!ai) {
      return res.json({
        answer: `Hello! I am **Ask e-Yantra**, your AI assistant for e-Yantra LNJPIT Chapra.\n\ne-Yantra LNJPIT is a premier robotics and engineering innovation laboratory at LNJPIT Chapra, mentored by faculty and student leads specializing in ROS 2, Embedded Systems (ESP32), AI, and IoT.\n\nKey highlights:\n- **Faculty Mentors**: ${faculty.map(f => f.name).join(', ')}\n- **Student President**: Aarav Kumar\n- **Flagship Project**: Autonomous Agricultural Rover (AgriBot)\n- **Upcoming Event**: e-LNJPIT HackRobotics 2026\n\nYou can apply to join our community at /join or reach us at lnjpiteyantra@gmail.com!`
      });
    }

    const prompt = `You are "Ask e-Yantra", an AI Assistant for e-Yantra LNJPIT at Lok Nayak Jai Prakash Institute of Technology, Chapra, Bihar.
Use the following context to answer the user's question accurately, concisely, and encouragingly.

CONTEXT:
${context}

USER QUESTION:
${question}

Answer in markdown format:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    res.json({ answer: response.text || 'Thank you for reaching out to e-Yantra LNJPIT!' });
  } catch (err: any) {
    console.error('AI query error:', err);
    res.status(500).json({ error: 'Failed to query AI assistant' });
  }
});

router.post('/ai/project-assistant', async (req: Request, res: Response) => {
  try {
    const { goal, domain, experienceLevel } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: `AI Blueprint: ${goal}`,
        summary: `A structured project plan for building "${goal}" in the ${domain || 'Robotics'} domain at ${experienceLevel || 'Intermediate'} level.`,
        requiredSkills: ['C++', 'Microcontroller I/O', 'Sensor Interfacing', 'Motor Kinematics'],
        hardwareList: ['ESP32 / Arduino UNO', 'L298N Motor Driver Board', 'Ultrasonic HC-SR04 Sensor', '12V Li-Ion Battery Pack'],
        softwareTools: ['Arduino IDE / PlatformIO', 'C++ Standard Libraries', 'Fritzing Circuit Planner'],
        architectureOverview: 'Sensor readings trigger real-time interrupt routines that update motor PID loop output.',
        learningSteps: [
          'Step 1: Test basic GPIO and serial monitoring.',
          'Step 2: Calibrate ultrasonic distance measurements.',
          'Step 3: Implement PWM differential motor steering.',
          'Step 4: Combine into autonomous obstacle avoidance state machine.'
        ],
        safetyConsiderations: ['Ensure flyback diodes on motor inductive loads', 'Never short battery terminals'],
        estimatedComplexity: `${experienceLevel || 'Intermediate'} - 3 to 4 Weeks`
      });
    }

    const prompt = `Generate a JSON object for a technical project blueprint with exact fields:
"title", "summary", "requiredSkills" (array of strings), "hardwareList" (array of strings), "softwareTools" (array of strings), "architectureOverview", "learningSteps" (array of strings), "safetyConsiderations" (array of strings), "estimatedComplexity".

Student Goal: "${goal}"
Domain: "${domain || 'Robotics'}"
Experience Level: "${experienceLevel || 'Intermediate'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Project Assistant error:', err);
    res.status(500).json({ error: 'Failed to generate project blueprint' });
  }
});

export default router;
