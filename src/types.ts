export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'FACULTY' 
  | 'COORDINATOR' 
  | 'TECHNICAL_LEAD' 
  | 'PROJECT_LEAD' 
  | 'MEMBER' 
  | 'APPLICANT';

export interface User {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  year?: string;
  studentId?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  domain?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status?: string;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  googleScholar?: string;
  researchGate?: string;
  other?: string;
}

export type TeamMemberType = 
  | 'FACULTY' 
  | 'TECHNICAL_LEAD' 
  | 'COORDINATOR' 
  | 'PROJECT_LEAD' 
  | 'MEMBER' 
  | 'LAB_ASSISTANT'
  | 'ALUMNI'
  | 'ADVISOR'
  | 'OTHER';

export interface ProfilePhoto {
  url: string;
  publicId?: string;
  filename?: string;
  size?: number;
  uploadedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  slug: string;
  memberType: TeamMemberType | string;
  designation: string;
  department: string;
  batch?: string;
  college?: string;
  shortBio?: string;
  fullBiography?: string;
  skills: string[];
  areasOfInterest: string[];
  projects: string[];
  achievements: string[];
  responsibilities: string[];
  photo: string;
  profilePhoto?: ProfilePhoto;
  photoStorageId?: string;
  photoFilename?: string;
  email: string;
  phone?: string;
  socialLinks: SocialLinks;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  visibility?: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  slug: string;
  designation: string;
  department: string;
  qualification: string;
  expertise: string[];
  researchInterests: string[];
  bio: string;
  email: string;
  linkedin?: string;
  photo: string;
  publications?: string[];
  mentorshipAreas: string[];
  isPublished: boolean;
  order: number;
}

export interface StudentCoordinator {
  id: string;
  name: string;
  slug: string;
  position: string;
  branch: string;
  year: string;
  skills: string[];
  bio: string;
  projectsCount?: number;
  linkedin?: string;
  github?: string;
  email: string;
  photo: string;
  joiningYear: string;
  responsibilities: string[];
  order: number;
}

export interface TechnicalLead {
  id: string;
  name: string;
  slug: string;
  domain: 'Robotics' | 'AI/ML' | 'IoT' | 'Embedded' | 'Programming' | 'Electronics' | 'Mechanical' | 'Computer Vision';
  position: string;
  branch: string;
  year: string;
  skills: string[];
  bio: string;
  photo: string;
  github?: string;
  linkedin?: string;
  email: string;
}

export interface ProjectMember {
  name: string;
  role: string;
  photo?: string;
}

export type ProjectStatus = 'Idea' | 'Planning' | 'Development' | 'Testing' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  problemStatement: string;
  objective: string;
  solution: string;
  category: string;
  technologies: string[];
  hardware: string[];
  software: string[];
  architecture?: string;
  year: string;
  status: ProjectStatus;
  image: string;
  galleryImages?: string[];
  facultyMentor?: string;
  technicalLead?: string;
  projectLead?: string;
  teamMembers: ProjectMember[];
  demoVideo?: string;
  githubUrl?: string;
  documentationUrl?: string;
  results?: string;
  futureImprovements?: string;
  isFeatured: boolean;
  createdAt: string;
}

export type EventStatus = 'Upcoming' | 'Registration Open' | 'Registration Closed' | 'Completed';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDetails?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  speaker?: string;
  facultyCoordinator?: string;
  studentCoordinator?: string;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  poster: string;
  gallery?: string[];
  status: EventStatus;
  category: 'Workshop' | 'Robotics Competition' | 'Hackathon' | 'Seminar' | 'Guest Lecture' | 'Training Session' | 'Orientation' | 'Recruitment';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  studentId?: string;
  skills: string;
  teamPreference?: string;
  registeredAt: string;
  status: 'Confirmed' | 'Attended' | 'Cancelled';
}

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected';

export interface CommunityApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  skills: string[];
  domains: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  whyJoin: string;
  previousProjects?: string;
  experience?: string;
  resumeUrl?: string;
  photoUrl?: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewerNotes?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  author: string;
  category: 'Robotics' | 'AI' | 'IoT' | 'Projects' | 'Events' | 'Achievements' | 'Tutorials' | 'Announcements';
  content: string;
  tags: string[];
  publishDate: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  views?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'Events' | 'Workshops' | 'Projects' | 'Team' | 'Campus' | 'Competitions' | 'Robotics' | 'Achievements';
  caption: string;
  date: string;
}

export interface LearningResource {
  id: string;
  title: string;
  category: 'Robotics' | 'Arduino' | 'ESP32' | 'Raspberry Pi' | 'Embedded Systems' | 'Python' | 'C/C++' | 'AI/ML' | 'Computer Vision' | 'IoT' | 'Electronics' | 'CAD' | 'Git/GitHub';
  description: string;
  type: 'PDF' | 'Tutorial' | 'Video' | 'Documentation' | 'GitHub Repository' | 'External Link';
  linkUrl: string;
  author?: string;
  tags: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  image?: string;
  awardLevel?: string;
  team?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  targetRecord: string;
  timestamp: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  officialEmail: string;
  phone: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  noticeBanner?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  batch: string;
  content: string;
  avatar: string;
}

export interface AIProjectIdeaRequest {
  goal: string;
  domain: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AIProjectIdeaResponse {
  title: string;
  summary: string;
  requiredSkills: string[];
  hardwareList: string[];
  softwareTools: string[];
  architectureOverview: string;
  learningSteps: string[];
  safetyConsiderations: string[];
  estimatedComplexity: string;
}
