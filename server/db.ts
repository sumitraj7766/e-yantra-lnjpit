import { connectToMongoDB, getDatabaseStatus, isMongoConnected } from './mongodb.js';
import {
  UserModel,
  FacultyModel,
  CoordinatorModel,
  TechnicalLeadModel,
  MemberModel,
  ProjectModel,
  EventModel,
  EventRegistrationModel,
  JoinApplicationModel,
  GalleryModel,
  BlogPostModel,
  AchievementModel,
  ResourceModel,
  ContactMessageModel,
  NotificationModel,
  AuditLogModel,
  SettingsModel,
  IUser,
  IFaculty,
  IStudentCoordinator,
  ITechnicalLead,
  IMember,
  IProject,
  IEvent,
  IEventRegistration,
  IJoinApplication,
  IGalleryItem,
  IBlogPost,
  IAchievement,
  ILearningResource,
  IContactMessage,
  INotification,
  IAuditLog,
  ISettings
} from './models/index.js';

// Default initial dataset for initial database seeding & resilient local memory fallback
const SEED_USERS: IUser[] = [
  {
    id: 'usr-superadmin-01',
    username: 'admin',
    email: 'lnjpiteyantra@gmail.com',
    password: 'admin',
    name: 'e-Yantra LNJPIT Admin',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: 'Electronics & Communication Engineering',
    year: 'Faculty In-Charge',
    phone: '+91 6152 280000',
    studentId: 'FAC-EY-001',
    bio: 'Official Administrative Lead and System Controller for the e-Yantra LNJPIT Innovation and Robotics Hub.',
    skills: ['Robotics Infrastructure', 'ROS 2', 'Embedded Systems', 'Lab Management'],
    domain: 'Robotics & Control Systems',
    githubUrl: 'https://github.com/eyantra-lnjpit',
    linkedinUrl: 'https://linkedin.com/company/eyantra-lnjpit'
  },
  {
    id: 'usr-faculty-01',
    username: 'rksharma',
    email: 'faculty.eyantra@lnjpit.ac.in',
    password: 'faculty123',
    name: 'Dr. R. K. Sharma',
    role: 'FACULTY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    department: 'Electronics & Communication Engineering',
    year: 'Associate Professor',
    phone: '+91 94310 11223',
    studentId: 'FAC-ECE-012',
    bio: 'Faculty Mentor & In-charge of Robotics & Embedded Systems Research Lab at LNJPIT Chapra.',
    skills: ['Autonomous Systems', 'Microcontroller Architecture', 'Signal Processing'],
    domain: 'Embedded Systems & Automation',
    githubUrl: 'https://github.com/eyantra-lnjpit',
    linkedinUrl: 'https://linkedin.com/in/demofaculty-rksharma'
  },
  {
    id: 'usr-student-01',
    username: 'aarav',
    email: 'student.lead@lnjpit.ac.in',
    password: 'student123',
    name: 'Aarav Kumar',
    role: 'COORDINATOR',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    department: 'Electronics & Communication Engineering',
    year: '4th Year',
    phone: '+91 91234 56789',
    studentId: '2210401',
    bio: 'Student President of e-Yantra LNJPIT Chapra. Passionate about robotics kinematics and autonomous navigation.',
    skills: ['ROS 2 Humble', 'Embedded C/C++', 'ESP32 / STM32', 'Python', 'Kinematics', 'PCB Layout'],
    domain: 'Robotics & Autonomous Systems',
    githubUrl: 'https://github.com/aaravk-lnjpit',
    linkedinUrl: 'https://linkedin.com/in/aaravkumar-robotics'
  }
];

const SEED_FACULTY: IFaculty[] = [
  {
    id: 'fac-01',
    name: 'Dr. R. K. Sharma',
    slug: 'dr-rk-sharma',
    designation: 'Faculty Coordinator & Associate Professor',
    department: 'Electronics & Communication Engineering',
    qualification: 'Ph.D. in Robotics & Control Systems (IIT Patna)',
    expertise: ['Robotics', 'Embedded Systems', 'Signal Processing', 'Control Engineering'],
    researchInterests: ['Autonomous Navigation', 'Micro-Robotics', 'Sensor Fusion'],
    bio: 'Dr. R. K. Sharma has over 14 years of teaching and research experience in robotics and embedded systems. He leads the e-Yantra initiative at LNJPIT Chapra with a vision to nurture hands-on engineering excellence among students.',
    email: 'rksharma@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/demofaculty-rksharma',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    publications: [
      'Design and Implementation of Low-Cost Agricultural Rovers (IEEE 2024)',
      'Sensor Fusion Algorithms for Autonomous Drone Navigation (Journal of Robotics 2023)'
    ],
    mentorshipAreas: ['Autonomous Rovers', 'Microcontroller Architecture', 'IoT Networks'],
    isPublished: true,
    order: 1
  },
  {
    id: 'fac-02',
    name: 'Dr. S. N. Singh',
    slug: 'dr-sn-singh',
    designation: 'Co-Faculty Mentor & Assistant Professor',
    department: 'Computer Science & Engineering',
    qualification: 'Ph.D. in Artificial Intelligence & Computer Vision',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Deep Learning'],
    researchInterests: ['Edge AI for Robotics', 'Visual SLAM', 'Object Detection on Embedded Systems'],
    bio: 'Dr. S. N. Singh specializes in artificial intelligence, computer vision, and machine learning pipelines deployed on edge hardware. He co-mentors e-Yantra projects involving automated defect detection and visual navigation.',
    email: 'snsingh@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/demofaculty-snsingh',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    publications: [
      'Edge-based Deep Learning for Real-Time Weed Detection (Springer 2025)',
      'YOLOv8 Optimization for Embedded Robotics Platforms (IJCV 2024)'
    ],
    mentorshipAreas: ['Computer Vision', 'Deep Learning Models', 'ROS 2 AI Nodes'],
    isPublished: true,
    order: 2
  }
];

const SEED_COORDINATORS: IStudentCoordinator[] = [
  {
    id: 'coord-01',
    name: 'Aarav Kumar',
    position: 'Student President & Overall Coordinator',
    branch: 'Electronics & Communication Engineering',
    year: '4th Year (Batch 2022-26)',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    email: 'aarav.kumar@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/aaravkumar-robotics',
    github: 'https://github.com/aaravk-lnjpit',
    bio: 'President of e-Yantra LNJPIT Chapra. Passionate about robotics kinematics, ROS 2 navigation pipelines, and microcontroller firmware.',
    responsibilities: ['Overall Lab Operations & Project Supervision', 'e-Yantra IIT Bombay Liaison', 'Hackathon & Workshop Organizer'],
    technicalSkills: ['ROS 2 Humble', 'Embedded C/C++', 'ESP32 / STM32', 'Python', 'Kinematics', 'PCB Layout'],
    achievements: ['Rank 3 in e-Yantra Robotics Competition (eYRC 2024-25)', 'Winner of State Inter-College Robotics Cup 2024'],
    order: 1
  },
  {
    id: 'coord-02',
    name: 'Priya Sharma',
    position: 'Vice President & Embedded Lead',
    branch: 'Computer Science & Engineering',
    year: '4th Year (Batch 2022-26)',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    email: 'priya.sharma@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/priyasharma-embed',
    github: 'https://github.com/priyas-embedded',
    bio: 'Leads the Embedded Systems & IoT division. Specializes in real-time firmware, FreeRTOS, and telemetry dashboard development.',
    responsibilities: ['Hardware Procurement & Lab Inventory', 'Beginner Microcontroller Bootcamps', 'Telemetry & Cloud Integration'],
    technicalSkills: ['FreeRTOS', 'C/C++', 'MQTT / WebSockets', 'Circuit Design', 'KiCAD'],
    achievements: ['Finalist in National Embedded Innovation Challenge 2024'],
    order: 2
  }
];

const SEED_TECH_LEADS: ITechnicalLead[] = [
  {
    id: 'tech-01',
    name: 'Vikram Singh',
    domain: 'Robotics & ROS 2',
    domainBadge: 'Autonomous Systems',
    position: 'Technical Lead - Robotics & Kinematics',
    branch: 'Mechanical / Mechatronics',
    year: '3rd Year (Batch 2023-27)',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    email: 'vikram.singh@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/vikramsingh-ros',
    github: 'https://github.com/vikram-ros2',
    bio: 'Focuses on 2D/3D LiDAR SLAM, Nav2 costmaps, path planning algorithms, and chassis kinematics.',
    technicalSkills: ['ROS 2 Nav2', 'LiDAR SLAM', 'Differential Drive Kinematics', 'Gazebo Simulation', 'SolidWorks CAD'],
    projectsLed: ['Autonomous Agricultural Rover (AgriBot)', 'Warehouse AMR Prototype'],
    order: 1
  },
  {
    id: 'tech-02',
    name: 'Neha Verma',
    domain: 'Computer Vision & AI',
    domainBadge: 'Vision & Deep Learning',
    position: 'Technical Lead - Computer Vision & Edge AI',
    branch: 'Computer Science & Engineering',
    year: '3rd Year (Batch 2023-27)',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    email: 'neha.verma@lnjpit.ac.in',
    linkedin: 'https://linkedin.com/in/nehaverma-cv',
    github: 'https://github.com/neha-edgeai',
    bio: 'Specializes in embedded machine learning, YOLO inference on NVIDIA Jetson, and camera calibration for robotic arms.',
    technicalSkills: ['PyTorch', 'OpenCV', 'YOLOv8', 'TensorRT', 'NVIDIA Jetson Nano', 'Python'],
    projectsLed: ['Automated Crop Weed Detection Rover', 'Lab Security Object Detector'],
    order: 2
  }
];

const SEED_MEMBERS: IMember[] = [
  {
    id: 'mem-01',
    name: 'Aarav Kumar',
    email: 'aarav.kumar@lnjpit.ac.in',
    rollNo: '2210401',
    branch: 'ECE',
    year: '4th Year',
    domain: 'Robotics & ROS 2',
    role: 'Student President',
    status: 'Active',
    joinedDate: '2022-09-01',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    bio: 'Robotics Kinematics and ROS 2 developer.',
    skills: ['ROS 2', 'Embedded C', 'ESP32', 'Python']
  },
  {
    id: 'mem-02',
    name: 'Priya Sharma',
    email: 'priya.sharma@lnjpit.ac.in',
    rollNo: '2210108',
    branch: 'CSE',
    year: '4th Year',
    domain: 'Embedded Systems & IoT',
    role: 'Vice President',
    status: 'Active',
    joinedDate: '2022-09-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'IoT and FreeRTOS Firmware developer.',
    skills: ['FreeRTOS', 'C++', 'MQTT', 'KiCAD']
  }
];

const SEED_PROJECTS: IProject[] = [
  {
    id: 'prj-01',
    title: 'Autonomous Agricultural Rover (AgriBot)',
    slug: 'autonomous-agricultural-rover-agribot',
    shortDescription: 'Solar-powered agricultural rover for autonomous field navigation, soil moisture sensing, and targeted pesticide spraying using computer vision.',
    problemStatement: 'Farmers in Bihar face high manual labor costs and health hazards from indiscriminate pesticide spraying and uneven field monitoring.',
    methodology: 'Integrated ROS 2 Humble running on Raspberry Pi 4 with differential drive chassis, GPS waypoint navigation, and an ESP32 motor controller.',
    hardwareComponents: ['Raspberry Pi 4 (8GB)', 'ESP32 Dual-Core MCU', 'RP-LiDAR A1M8', '12V High-Torque Planetary DC Motors', '100W Monocrystalline Solar Panel', 'Soil NPK & Moisture Sensor'],
    softwareStack: ['ROS 2 Humble', 'Nav2 Path Planning', 'OpenCV Python', 'Micro-ROS', 'FastAPI Web Dashboard'],
    results: 'Achieved autonomous waypoint navigation with <5cm accuracy across rough terrain with 4 hours continuous battery life.',
    futureScope: 'Integrating multi-spectral crop stress imaging and autonomous solar docking station.',
    category: 'Robotics & Kinematics',
    leadName: 'Vikram Singh',
    leadRoll: '2310415',
    teamMembers: [
      { name: 'Vikram Singh', roll: '2310415', role: 'Hardware & Kinematics Lead' },
      { name: 'Neha Verma', roll: '2310102', role: 'Computer Vision Developer' },
      { name: 'Rahul Mishra', roll: '2310408', role: 'Embedded Firmware' }
    ],
    guideName: 'Dr. R. K. Sharma',
    status: 'Ongoing',
    year: '2025-2026',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    githubUrl: 'https://github.com/eyantra-lnjpit/agribot-rover',
    liveDemoUrl: 'https://agribot.eyantra-lnjpit.ac.in',
    isFeatured: true,
    tags: ['ROS 2', 'LiDAR', 'AgriTech', 'Autonomous', 'ESP32']
  },
  {
    id: 'prj-02',
    title: 'Smart Campus Micro-Grid & Energy Monitor',
    slug: 'smart-campus-microgrid-energy-monitor',
    shortDescription: 'IoT-enabled multi-channel electrical grid telemetry system with automated power factor correction and energy efficiency forecasting.',
    problemStatement: 'Lack of real-time monitoring leads to unoptimized power consumption in academic blocks and unnotified power spikes.',
    methodology: 'Deployed custom SCT-013 current sensors and ZMPT101B voltage modules sampled at 1kHz by ESP32 nodes streaming via MQTT to InfluxDB.',
    hardwareComponents: ['ESP32-WROOM-32D', 'SCT-013 Current Transformers', 'ZMPT101B Voltage Sensors', 'Relay Banks', 'OLED Display'],
    softwareStack: ['FreeRTOS', 'C++', 'MQTT / Mosquitto', 'InfluxDB', 'Grafana Dashboard'],
    results: 'Detected 18% unnecessary standby power usage in computer labs and automated power cutover.',
    futureScope: 'Deploying across all 6 campus hostels with mobile push notification alarms.',
    category: 'Embedded Systems & IoT',
    leadName: 'Priya Sharma',
    leadRoll: '2210108',
    teamMembers: [
      { name: 'Priya Sharma', roll: '2210108', role: 'System Architect' },
      { name: 'Amit Kumar', roll: '2310204', role: 'IoT Firmware' }
    ],
    guideName: 'Dr. S. N. Singh',
    status: 'Completed',
    year: '2025',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ],
    githubUrl: 'https://github.com/eyantra-lnjpit/campus-energy-monitor',
    isFeatured: true,
    tags: ['IoT', 'ESP32', 'FreeRTOS', 'Energy', 'MQTT']
  }
];

const SEED_EVENTS: IEvent[] = [
  {
    id: 'evt-01',
    title: 'e-LNJPIT HackRobotics 2026: Autonomous Systems Challenge',
    slug: 'e-lnjpit-hackrobotics-2026',
    shortDescription: 'Flagship 36-hour inter-college robotics hackathon with hardware sprint, track navigation, and project exhibition.',
    description: 'Join LNJPIT Chapra’s premier robotics hackathon! Teams will construct and program autonomous rovers to solve real-world industrial and agricultural navigation problems on a specially crafted arena.',
    category: 'Hackathon',
    date: '2026-10-15',
    endDate: '2026-10-17',
    time: '09:00 AM - 06:00 PM',
    venue: 'LNJPIT Main Auditorium & e-Yantra Robotics Lab',
    bannerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    registrationOpen: true,
    registrationDeadline: '2026-10-01',
    capacity: 150,
    registeredCount: 38,
    prerequisites: ['Basic Arduino / ESP32 programming', 'Interest in robotics chassis', 'Team size: 2 to 4 members'],
    agenda: [
      { time: 'Day 1 - 09:00 AM', session: 'Opening Ceremony & Theme Reveal', speaker: 'Dr. R. K. Sharma' },
      { time: 'Day 1 - 11:00 AM', session: 'Hardware Kit Distribution & Sprint Start' },
      { time: 'Day 2 - 02:00 PM', session: 'Track Navigation Round' },
      { time: 'Day 3 - 04:00 PM', session: 'Award Ceremony & Prize Distribution' }
    ],
    speakers: [
      { name: 'Dr. R. K. Sharma', designation: 'Associate Professor & Coordinator', org: 'LNJPIT Chapra' },
      { name: 'Aarav Kumar', designation: 'President', org: 'e-Yantra LNJPIT' }
    ],
    prizePool: '₹50,000 Cash Prize + Certificate of Excellence',
    isFeatured: true
  },
  {
    id: 'evt-02',
    title: 'Hands-on ROS 2 Navigation & SLAM Bootcamp',
    slug: 'hands-on-ros2-navigation-bootcamp',
    shortDescription: 'Intensive 3-day technical workshop covering ROS 2 Humble, Gazebo simulation, LiDAR mapping, and Nav2.',
    description: 'Learn the industry-standard Robot Operating System from scratch! This workshop takes participants from ROS 2 nodes and topics to full LiDAR SLAM mapping and autonomous path navigation on real hardware.',
    category: 'Workshop',
    date: '2026-09-20',
    endDate: '2026-09-22',
    time: '10:00 AM - 04:30 PM',
    venue: 'Central Computer Center & e-Yantra Lab, LNJPIT',
    bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    registrationOpen: true,
    registrationDeadline: '2026-09-18',
    capacity: 80,
    registeredCount: 52,
    prerequisites: ['C++ or Python basics', 'Laptop with Ubuntu 22.04 or Dual Boot (Assistance provided)'],
    agenda: [
      { time: 'Day 1', session: 'ROS 2 Architecture, Nodes, Topics & Services' },
      { time: 'Day 2', session: 'URDF Modeling, Gazebo Simulation & LiDAR Integration' },
      { time: 'Day 3', session: 'Nav2 Costmaps, SLAM Mapping, and Hardware Testing' }
    ],
    speakers: [
      { name: 'Vikram Singh', designation: 'Technical Lead', org: 'e-Yantra LNJPIT' },
      { name: 'Dr. S. N. Singh', designation: 'Assistant Professor', org: 'LNJPIT Chapra' }
    ],
    prizePool: 'Free Hardware Development Kits for Top 3 Performers',
    isFeatured: true
  }
];

const SEED_BLOG: IBlogPost[] = [
  {
    id: 'blog-01',
    title: 'Getting Started with ROS 2 Humble on Raspberry Pi 4 for Robotics',
    slug: 'getting-started-ros2-humble-raspberry-pi4',
    excerpt: 'A comprehensive step-by-step guide from e-Yantra LNJPIT on flashing Ubuntu 22.04 Server, installing ROS 2 Humble, and configuring Micro-ROS with ESP32.',
    content: `## Introduction to Modern Robotics with ROS 2\n\nThe Robot Operating System (ROS 2) has revolutionized how modern robotics engineers build autonomous systems. At LNJPIT Chapra's e-Yantra lab, ROS 2 serves as the primary backbone for all mobile robot research.\n\n### Step 1: Flashing Ubuntu 22.04 LTS Server\nUse Raspberry Pi Imager to install **Ubuntu 22.04 64-bit Server** onto a high-speed SanDisk Extreme microSD card (32GB+ recommended).\n\n### Step 2: Setting up ROS 2 Humble Repositories\n\`\`\`bash\nsudo apt update && sudo apt install curl gnupg lsb-release\nsudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg\necho "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null\n\`\`\`\n\n### Step 3: Installing ROS 2 Base\n\`\`\`bash\nsudo apt update\nsudo apt install ros-humble-ros-base python3-colcon-common-extensions\nsource /opt/ros/humble/setup.bash\n\`\`\`\n\n### Micro-ROS on ESP32\nConnect your ESP32 board over UART or Wi-Fi using the \`micro_ros_agent\` container to bridge sensor messages into ROS 2 topics seamlessly!`,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    author: 'Vikram Singh',
    authorRole: 'Technical Lead - Robotics',
    publishDate: '2026-08-10',
    readTime: '6 min read',
    category: 'Tutorial',
    tags: ['ROS 2', 'Raspberry Pi', 'ESP32', 'Robotics', 'Tutorial'],
    isFeatured: true,
    views: 342
  }
];

const SEED_GALLERY: IGalleryItem[] = [
  {
    id: 'gal-01',
    title: 'e-Yantra Lab Inauguration & Workspace',
    category: 'Lab',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    description: 'High-precision soldering stations, oscilloscope benches, and chassis test arena at LNJPIT Chapra.',
    date: '2025-08-15',
    tags: ['Lab', 'Facilities', 'Hardware'],
    isFeatured: true
  },
  {
    id: 'gal-02',
    title: 'Hands-on Autonomous Rover Track Testing',
    category: 'Projects',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    description: 'Students calibrating LiDAR distance thresholds and wheel encoders on differential drive rover.',
    date: '2025-11-20',
    tags: ['Rover', 'LiDAR', 'Testing'],
    isFeatured: true
  }
];

const SEED_RESOURCES: ILearningResource[] = [
  {
    id: 'res-01',
    title: 'ESP32 Micro-ROS Official Starter Template',
    category: 'ESP32 / IoT',
    description: 'Production-ready PlatformIO repository with FreeRTOS tasks, Wi-Fi reconnection logic, and custom ROS 2 message publishers.',
    difficulty: 'Intermediate',
    link: 'https://github.com/eyantra-lnjpit/esp32-microros-starter',
    type: 'GitHub',
    tags: ['ESP32', 'Micro-ROS', 'C++', 'PlatformIO'],
    addedDate: '2026-07-15'
  },
  {
    id: 'res-02',
    title: 'Differential Drive Kinematics & Odometry Math Guide',
    category: 'Kinematics',
    description: 'Clear illustrated PDF explaining forward and inverse kinematics, wheel ticks conversion to metric velocity, and quaternion math.',
    difficulty: 'Beginner',
    link: 'https://eyantra-lnjpit.ac.in/resources/diff-drive-math.pdf',
    type: 'PDF',
    tags: ['Kinematics', 'Mathematics', 'Odometry'],
    addedDate: '2026-08-01'
  }
];

const SEED_ACHIEVEMENTS: IAchievement[] = [
  {
    id: 'ach-01',
    title: 'Rank 3 - National Finals at eYRC (IIT Bombay)',
    competition: 'e-Yantra Robotics Competition 2024-25',
    organizer: 'IIT Bombay & Ministry of Education, Govt. of India',
    date: 'April 2025',
    rank: '3rd Place (National Level)',
    teamMembers: ['Aarav Kumar', 'Priya Sharma', 'Vikram Singh', 'Rahul Mishra'],
    description: 'Designed and deployed an autonomous warehouse sorting robot navigating complex multi-level obstacles using computer vision and Dijkstra path planning.',
    photoUrl: 'https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&q=80&w=800',
    isFeatured: true
  }
];

const SEED_SETTINGS: ISettings = {
  siteName: 'e-Yantra LNJPIT',
  tagline: 'Robotics & Engineering Excellence at LNJPIT Chapra',
  officialEmail: 'lnjpiteyantra@gmail.com',
  phone: '+91 6152 280000',
  address: 'LNJPIT Campus, Chapra, Saran, Bihar - 841302',
  githubUrl: 'https://github.com/eyantra-lnjpit',
  linkedinUrl: 'https://linkedin.com/company/eyantra-lnjpit',
  instagramUrl: 'https://instagram.com/eyantra_lnjpit',
  youtubeUrl: 'https://youtube.com/@eyantra_lnjpit',
  noticeBanner: '🚀 Registration Open: e-LNJPIT HackRobotics 2026 & ROS 2 Navigation Bootcamp!',
  faqs: [
    {
      id: 'faq-01',
      question: 'Who can join the e-Yantra LNJPIT club?',
      answer: 'All enrolled undergraduate students of Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra across any engineering discipline (ECE, CSE, ME, CE, EEE) are eligible to apply.',
      category: 'Membership',
      order: 1
    },
    {
      id: 'faq-02',
      question: 'Do I need prior robotics or coding experience to apply?',
      answer: 'No! While prior experience in C++, Python, or Arduino is helpful, our primary criteria are genuine curiosity, problem-solving mindset, and dedication to learn hands-on engineering.',
      category: 'Recruitment',
      order: 2
    }
  ],
  testimonials: [
    {
      id: 't-01',
      name: 'Dr. R. K. Sharma',
      role: 'Faculty Coordinator, LNJPIT',
      quote: 'e-Yantra has transformed theoretical concepts into working robotic prototypes for our undergraduate students.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  ]
};

// ==========================================
// RESILIENT IN-MEMORY STORAGE STATE
// ==========================================
let memUsers: IUser[] = JSON.parse(JSON.stringify(SEED_USERS));
let memFaculty: IFaculty[] = JSON.parse(JSON.stringify(SEED_FACULTY));
let memCoordinators: IStudentCoordinator[] = JSON.parse(JSON.stringify(SEED_COORDINATORS));
let memTechLeads: ITechnicalLead[] = JSON.parse(JSON.stringify(SEED_TECH_LEADS));
let memMembers: IMember[] = JSON.parse(JSON.stringify(SEED_MEMBERS));
let memProjects: IProject[] = JSON.parse(JSON.stringify(SEED_PROJECTS));
let memEvents: IEvent[] = JSON.parse(JSON.stringify(SEED_EVENTS));
let memEventRegistrations: IEventRegistration[] = [];
let memApplications: IJoinApplication[] = [];
let memGallery: IGalleryItem[] = JSON.parse(JSON.stringify(SEED_GALLERY));
let memBlog: IBlogPost[] = JSON.parse(JSON.stringify(SEED_BLOG));
let memAchievements: IAchievement[] = JSON.parse(JSON.stringify(SEED_ACHIEVEMENTS));
let memResources: ILearningResource[] = JSON.parse(JSON.stringify(SEED_RESOURCES));
let memContactMessages: IContactMessage[] = [];
let memNotifications: INotification[] = [];
let memAuditLogs: IAuditLog[] = [];
let memSettings: ISettings = JSON.parse(JSON.stringify(SEED_SETTINGS));

let isSeeding = false;

/**
 * Initialize database and sync/seed to MongoDB Atlas if connected
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const m = await connectToMongoDB();
    if (!m || !isMongoConnected()) {
      console.log('[Database] Operating with resilient in-memory store preloaded with e-Yantra LNJPIT dataset.');
      return;
    }

    if (isSeeding) return;
    isSeeding = true;

    console.log('[Database] Checking collection counts for automatic initial seeding in MongoDB Atlas...');

    // 1. Seed Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      await UserModel.insertMany(SEED_USERS);
      console.log(`[Database] Seeded ${SEED_USERS.length} default users into MongoDB.`);
    }

    // 2. Seed Faculty
    const facultyCount = await FacultyModel.countDocuments();
    if (facultyCount === 0) {
      await FacultyModel.insertMany(SEED_FACULTY);
      console.log(`[Database] Seeded ${SEED_FACULTY.length} faculty coordinators into MongoDB.`);
    }

    // 3. Seed Coordinators
    const coordCount = await CoordinatorModel.countDocuments();
    if (coordCount === 0) {
      await CoordinatorModel.insertMany(SEED_COORDINATORS);
      console.log(`[Database] Seeded ${SEED_COORDINATORS.length} student coordinators into MongoDB.`);
    }

    // 4. Seed Technical Leads
    const techCount = await TechnicalLeadModel.countDocuments();
    if (techCount === 0) {
      await TechnicalLeadModel.insertMany(SEED_TECH_LEADS);
      console.log(`[Database] Seeded ${SEED_TECH_LEADS.length} technical leads into MongoDB.`);
    }

    // 5. Seed Members
    const memberCount = await MemberModel.countDocuments();
    if (memberCount === 0) {
      await MemberModel.insertMany(SEED_MEMBERS);
      console.log(`[Database] Seeded ${SEED_MEMBERS.length} members into MongoDB.`);
    }

    // 6. Seed Projects
    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      await ProjectModel.insertMany(SEED_PROJECTS);
      console.log(`[Database] Seeded ${SEED_PROJECTS.length} projects into MongoDB.`);
    }

    // 7. Seed Events
    const eventCount = await EventModel.countDocuments();
    if (eventCount === 0) {
      await EventModel.insertMany(SEED_EVENTS);
      console.log(`[Database] Seeded ${SEED_EVENTS.length} events into MongoDB.`);
    }

    // 8. Seed Blog
    const blogCount = await BlogPostModel.countDocuments();
    if (blogCount === 0) {
      await BlogPostModel.insertMany(SEED_BLOG);
      console.log(`[Database] Seeded ${SEED_BLOG.length} blog posts into MongoDB.`);
    }

    // 9. Seed Gallery
    const galleryCount = await GalleryModel.countDocuments();
    if (galleryCount === 0) {
      await GalleryModel.insertMany(SEED_GALLERY);
      console.log(`[Database] Seeded ${SEED_GALLERY.length} gallery items into MongoDB.`);
    }

    // 10. Seed Resources
    const resourceCount = await ResourceModel.countDocuments();
    if (resourceCount === 0) {
      await ResourceModel.insertMany(SEED_RESOURCES);
      console.log(`[Database] Seeded ${SEED_RESOURCES.length} learning resources into MongoDB.`);
    }

    // 11. Seed Achievements
    const achievementCount = await AchievementModel.countDocuments();
    if (achievementCount === 0) {
      await AchievementModel.insertMany(SEED_ACHIEVEMENTS);
      console.log(`[Database] Seeded ${SEED_ACHIEVEMENTS.length} achievements into MongoDB.`);
    }

    // 12. Seed Settings
    const settingsDoc = await SettingsModel.findOne();
    if (!settingsDoc) {
      await SettingsModel.create(SEED_SETTINGS);
      console.log('[Database] Seeded site settings into MongoDB.');
    }

    console.log('[Database] MongoDB Atlas database initialization & verification complete.');
  } catch (err: any) {
    console.warn('[Database] Database initialization notice:', err.message);
  } finally {
    isSeeding = false;
  }
}

/**
 * MongoDB Data Access Service Layer with dual-mode MongoDB Atlas + Memory Fallback
 */
export const db = {
  // Database status
  getStatus: getDatabaseStatus,

  // USERS
  getUsers: async (): Promise<IUser[]> => {
    if (isMongoConnected()) {
      try {
        const users = await UserModel.find().sort({ createdAt: -1 }).lean();
        if (users && users.length > 0) return users as unknown as IUser[];
      } catch (e) {
        console.warn('[DB Users] Mongoose query fallback:', (e as any).message);
      }
    }
    return memUsers;
  },
  findUserByEmail: async (email: string): Promise<IUser | null> => {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected()) {
      try {
        const user = await UserModel.findOne({ email: cleanEmail }).lean();
        if (user) return user as unknown as IUser;
      } catch (e) {
        console.warn('[DB User] Mongoose query fallback:', (e as any).message);
      }
    }
    return memUsers.find(u => u.email.toLowerCase().trim() === cleanEmail) || null;
  },
  findUserByUsernameOrEmail: async (identifier: string): Promise<IUser | null> => {
    const clean = identifier.toLowerCase().trim();
    if (isMongoConnected()) {
      try {
        const user = await UserModel.findOne({
          $or: [{ email: clean }, { username: clean }]
        }).lean();
        if (user) return user as unknown as IUser;
      } catch (e) {
        console.warn('[DB User] Mongoose query fallback:', (e as any).message);
      }
    }
    return memUsers.find(u => 
      u.email.toLowerCase().trim() === clean || 
      (u.username && u.username.toLowerCase().trim() === clean)
    ) || null;
  },
  findUserById: async (id: string): Promise<IUser | null> => {
    if (isMongoConnected()) {
      try {
        const user = await UserModel.findOne({ id }).lean();
        if (user) return user as unknown as IUser;
      } catch (e) {
        console.warn('[DB User] Mongoose query fallback:', (e as any).message);
      }
    }
    return memUsers.find(u => u.id === id) || null;
  },
  findUserByIdOrUsername: async (idOrUsername: string): Promise<IUser | null> => {
    const clean = idOrUsername.toLowerCase().trim();
    if (isMongoConnected()) {
      try {
        const user = await UserModel.findOne({
          $or: [{ id: idOrUsername }, { username: clean }, { email: clean }]
        }).lean();
        if (user) return user as unknown as IUser;
      } catch (e) {
        console.warn('[DB User] Mongoose query fallback:', (e as any).message);
      }
    }
    return memUsers.find(u => 
      u.id === idOrUsername || 
      (u.username && u.username.toLowerCase().trim() === clean) ||
      u.email.toLowerCase().trim() === clean
    ) || null;
  },
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    const cleanEmail = (userData.email || '').toLowerCase().trim();
    const defaultUsername = cleanEmail ? cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') : `user_${Date.now()}`;
    const newDoc: IUser = {
      id: userData.id || `usr-${Date.now()}`,
      username: userData.username ? userData.username.toLowerCase().trim() : defaultUsername,
      email: cleanEmail,
      password: userData.password || 'eyantra123',
      name: userData.name ? userData.name.trim() : 'e-Yantra Member',
      role: userData.role || 'MEMBER',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      department: userData.department || 'Electronics & Communication Engineering',
      year: userData.year || '3rd Year',
      studentId: userData.studentId || '',
      phone: userData.phone || '',
      bio: userData.bio || '',
      skills: userData.skills || [],
      domain: userData.domain || 'Robotics & Automation',
      githubUrl: userData.githubUrl || '',
      linkedinUrl: userData.linkedinUrl || '',
      portfolioUrl: userData.portfolioUrl || '',
      status: userData.status || 'Active',
      joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0]
    };
    memUsers.unshift(newDoc);

    if (isMongoConnected()) {
      try {
        const doc = new UserModel(newDoc);
        await doc.save();
      } catch (e) {
        console.warn('[DB User] Mongoose write fallback:', (e as any).message);
      }
    }
    return newDoc;
  },
  updateUser: async (id: string, update: Partial<IUser>): Promise<IUser | null> => {
    const idx = memUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      memUsers[idx] = { ...memUsers[idx], ...update, updatedAt: new Date() };
    }

    if (isMongoConnected()) {
      try {
        const doc = await UserModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IUser;
      } catch (e) {
        console.warn('[DB User] Mongoose update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memUsers[idx] : null;
  },
  deleteUser: async (id: string): Promise<boolean> => {
    memUsers = memUsers.filter(u => u.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await UserModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB User] Mongoose delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // FACULTY
  getFaculty: async (publishedOnly: boolean = false): Promise<IFaculty[]> => {
    if (isMongoConnected()) {
      try {
        const query = publishedOnly ? { isPublished: true } : {};
        const items = await FacultyModel.find(query).sort({ order: 1, createdAt: 1 }).lean();
        if (items && items.length > 0) return items as unknown as IFaculty[];
      } catch (e) {
        console.warn('[DB Faculty] Mongoose query fallback:', (e as any).message);
      }
    }
    return publishedOnly ? memFaculty.filter(f => f.isPublished !== false) : memFaculty;
  },
  findFacultyByIdOrSlug: async (param: string): Promise<IFaculty | null> => {
    if (isMongoConnected()) {
      try {
        const f = await FacultyModel.findOne({ $or: [{ id: param }, { slug: param }] }).lean();
        if (f) return f as unknown as IFaculty;
      } catch (e) {
        console.warn('[DB Faculty] Mongoose find fallback:', (e as any).message);
      }
    }
    return memFaculty.find(f => f.id === param || f.slug === param) || null;
  },
  createFaculty: async (data: Partial<IFaculty>): Promise<IFaculty> => {
    const item: IFaculty = {
      id: data.id || `fac-${Date.now()}`,
      name: data.name || '',
      slug: data.slug || `faculty-${Date.now()}`,
      designation: data.designation || 'Faculty Coordinator',
      department: data.department || 'ECE',
      qualification: data.qualification || '',
      expertise: data.expertise || [],
      researchInterests: data.researchInterests || [],
      bio: data.bio || '',
      email: data.email || '',
      linkedin: data.linkedin,
      photo: data.photo,
      publications: data.publications || [],
      mentorshipAreas: data.mentorshipAreas || [],
      isPublished: data.isPublished ?? true,
      order: data.order || memFaculty.length + 1
    };
    memFaculty.push(item);

    if (isMongoConnected()) {
      try {
        const doc = new FacultyModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Faculty] Mongoose save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateFaculty: async (id: string, update: Partial<IFaculty>): Promise<IFaculty | null> => {
    const idx = memFaculty.findIndex(f => f.id === id);
    if (idx !== -1) {
      memFaculty[idx] = { ...memFaculty[idx], ...update };
    }

    if (isMongoConnected()) {
      try {
        const doc = await FacultyModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IFaculty;
      } catch (e) {
        console.warn('[DB Faculty] Mongoose update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memFaculty[idx] : null;
  },
  deleteFaculty: async (id: string): Promise<boolean> => {
    memFaculty = memFaculty.filter(f => f.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await FacultyModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Faculty] Mongoose delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // STUDENT COORDINATORS
  getCoordinators: async (): Promise<IStudentCoordinator[]> => {
    if (isMongoConnected()) {
      try {
        const items = await CoordinatorModel.find().sort({ order: 1, createdAt: 1 }).lean();
        if (items && items.length > 0) return items as unknown as IStudentCoordinator[];
      } catch (e) {
        console.warn('[DB Coordinators] Fallback:', (e as any).message);
      }
    }
    return memCoordinators;
  },
  findCoordinatorById: async (id: string): Promise<IStudentCoordinator | null> => {
    if (isMongoConnected()) {
      try {
        const item = await CoordinatorModel.findOne({ id }).lean();
        if (item) return item as unknown as IStudentCoordinator;
      } catch (e) {
        console.warn('[DB Coordinator] Fallback:', (e as any).message);
      }
    }
    return memCoordinators.find(c => c.id === id) || null;
  },
  createCoordinator: async (data: Partial<IStudentCoordinator>): Promise<IStudentCoordinator> => {
    const item: IStudentCoordinator = {
      id: data.id || `coord-${Date.now()}`,
      name: data.name || '',
      position: data.position || 'Student Coordinator',
      branch: data.branch || '',
      year: data.year || '4th Year',
      photo: data.photo,
      email: data.email || '',
      linkedin: data.linkedin,
      github: data.github,
      bio: data.bio || '',
      responsibilities: data.responsibilities || [],
      technicalSkills: data.technicalSkills || [],
      achievements: data.achievements || [],
      order: data.order || memCoordinators.length + 1
    };
    memCoordinators.push(item);

    if (isMongoConnected()) {
      try {
        const doc = new CoordinatorModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Coordinator] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateCoordinator: async (id: string, update: Partial<IStudentCoordinator>): Promise<IStudentCoordinator | null> => {
    const idx = memCoordinators.findIndex(c => c.id === id);
    if (idx !== -1) memCoordinators[idx] = { ...memCoordinators[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await CoordinatorModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IStudentCoordinator;
      } catch (e) {
        console.warn('[DB Coordinator] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memCoordinators[idx] : null;
  },
  deleteCoordinator: async (id: string): Promise<boolean> => {
    memCoordinators = memCoordinators.filter(c => c.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await CoordinatorModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Coordinator] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // TECHNICAL LEADS
  getTechnicalLeads: async (): Promise<ITechnicalLead[]> => {
    if (isMongoConnected()) {
      try {
        const items = await TechnicalLeadModel.find().sort({ order: 1, createdAt: 1 }).lean();
        if (items && items.length > 0) return items as unknown as ITechnicalLead[];
      } catch (e) {
        console.warn('[DB Leads] Fallback:', (e as any).message);
      }
    }
    return memTechLeads;
  },
  findTechnicalLeadById: async (id: string): Promise<ITechnicalLead | null> => {
    if (isMongoConnected()) {
      try {
        const item = await TechnicalLeadModel.findOne({ id }).lean();
        if (item) return item as unknown as ITechnicalLead;
      } catch (e) {
        console.warn('[DB Lead] Fallback:', (e as any).message);
      }
    }
    return memTechLeads.find(l => l.id === id) || null;
  },
  createTechnicalLead: async (data: Partial<ITechnicalLead>): Promise<ITechnicalLead> => {
    const item: ITechnicalLead = {
      id: data.id || `tech-${Date.now()}`,
      name: data.name || '',
      domain: data.domain || '',
      domainBadge: data.domainBadge || '',
      position: data.position || 'Technical Lead',
      branch: data.branch || '',
      year: data.year || '3rd Year',
      photo: data.photo,
      email: data.email || '',
      linkedin: data.linkedin,
      github: data.github,
      bio: data.bio || '',
      technicalSkills: data.technicalSkills || [],
      projectsLed: data.projectsLed || [],
      order: data.order || memTechLeads.length + 1
    };
    memTechLeads.push(item);

    if (isMongoConnected()) {
      try {
        const doc = new TechnicalLeadModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Lead] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateTechnicalLead: async (id: string, update: Partial<ITechnicalLead>): Promise<ITechnicalLead | null> => {
    const idx = memTechLeads.findIndex(l => l.id === id);
    if (idx !== -1) memTechLeads[idx] = { ...memTechLeads[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await TechnicalLeadModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as ITechnicalLead;
      } catch (e) {
        console.warn('[DB Lead] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memTechLeads[idx] : null;
  },
  deleteTechnicalLead: async (id: string): Promise<boolean> => {
    memTechLeads = memTechLeads.filter(l => l.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await TechnicalLeadModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Lead] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // MEMBERS
  getMembers: async (filter: Record<string, any> = {}): Promise<IMember[]> => {
    if (isMongoConnected()) {
      try {
        const items = await MemberModel.find(filter).sort({ joinedDate: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IMember[];
      } catch (e) {
        console.warn('[DB Members] Fallback:', (e as any).message);
      }
    }
    return memMembers;
  },
  findMemberById: async (id: string): Promise<IMember | null> => {
    if (isMongoConnected()) {
      try {
        const item = await MemberModel.findOne({ id }).lean();
        if (item) return item as unknown as IMember;
      } catch (e) {
        console.warn('[DB Member] Fallback:', (e as any).message);
      }
    }
    return memMembers.find(m => m.id === id) || null;
  },
  createMember: async (data: Partial<IMember>): Promise<IMember> => {
    const item: IMember = {
      id: data.id || `mem-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      rollNo: data.rollNo || '',
      branch: data.branch || 'ECE',
      year: data.year || '3rd Year',
      domain: data.domain || 'Robotics',
      role: data.role || 'Member',
      status: data.status || 'Active',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      avatar: data.avatar,
      bio: data.bio,
      skills: data.skills || []
    };
    memMembers.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new MemberModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Member] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateMember: async (id: string, update: Partial<IMember>): Promise<IMember | null> => {
    const idx = memMembers.findIndex(m => m.id === id);
    if (idx !== -1) memMembers[idx] = { ...memMembers[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await MemberModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IMember;
      } catch (e) {
        console.warn('[DB Member] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memMembers[idx] : null;
  },
  deleteMember: async (id: string): Promise<boolean> => {
    memMembers = memMembers.filter(m => m.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await MemberModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Member] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // PROJECTS
  getProjects: async (filter: Record<string, any> = {}): Promise<IProject[]> => {
    if (isMongoConnected()) {
      try {
        const items = await ProjectModel.find(filter).sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IProject[];
      } catch (e) {
        console.warn('[DB Projects] Fallback:', (e as any).message);
      }
    }
    return memProjects;
  },
  findProjectByIdOrSlug: async (param: string): Promise<IProject | null> => {
    if (isMongoConnected()) {
      try {
        const item = await ProjectModel.findOne({ $or: [{ id: param }, { slug: param }] }).lean();
        if (item) return item as unknown as IProject;
      } catch (e) {
        console.warn('[DB Project] Fallback:', (e as any).message);
      }
    }
    return memProjects.find(p => p.id === param || p.slug === param) || null;
  },
  createProject: async (data: Partial<IProject>): Promise<IProject> => {
    const item: IProject = {
      id: data.id || `prj-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || `project-${Date.now()}`,
      shortDescription: data.shortDescription || '',
      problemStatement: data.problemStatement,
      methodology: data.methodology,
      hardwareComponents: data.hardwareComponents || [],
      softwareStack: data.softwareStack || [],
      results: data.results,
      futureScope: data.futureScope,
      category: data.category || 'Robotics',
      leadName: data.leadName || '',
      leadRoll: data.leadRoll,
      teamMembers: data.teamMembers || [],
      guideName: data.guideName,
      status: data.status || 'Ongoing',
      year: data.year || '2026',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
      gallery: data.gallery || [],
      githubUrl: data.githubUrl,
      liveDemoUrl: data.liveDemoUrl,
      isFeatured: data.isFeatured ?? false,
      tags: data.tags || []
    };
    memProjects.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new ProjectModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Project] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateProject: async (id: string, update: Partial<IProject>): Promise<IProject | null> => {
    const idx = memProjects.findIndex(p => p.id === id);
    if (idx !== -1) memProjects[idx] = { ...memProjects[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await ProjectModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IProject;
      } catch (e) {
        console.warn('[DB Project] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memProjects[idx] : null;
  },
  deleteProject: async (id: string): Promise<boolean> => {
    memProjects = memProjects.filter(p => p.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await ProjectModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Project] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // EVENTS
  getEvents: async (filter: Record<string, any> = {}): Promise<IEvent[]> => {
    if (isMongoConnected()) {
      try {
        const items = await EventModel.find(filter).sort({ date: 1 }).lean();
        if (items && items.length > 0) return items as unknown as IEvent[];
      } catch (e) {
        console.warn('[DB Events] Fallback:', (e as any).message);
      }
    }
    return memEvents;
  },
  findEventByIdOrSlug: async (param: string): Promise<IEvent | null> => {
    if (isMongoConnected()) {
      try {
        const item = await EventModel.findOne({ $or: [{ id: param }, { slug: param }] }).lean();
        if (item) return item as unknown as IEvent;
      } catch (e) {
        console.warn('[DB Event] Fallback:', (e as any).message);
      }
    }
    return memEvents.find(e => e.id === param || e.slug === param) || null;
  },
  createEvent: async (data: Partial<IEvent>): Promise<IEvent> => {
    const item: IEvent = {
      id: data.id || `evt-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || `event-${Date.now()}`,
      shortDescription: data.shortDescription || '',
      description: data.description,
      category: data.category || 'Workshop',
      date: data.date || new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      time: data.time || '10:00 AM',
      venue: data.venue || 'LNJPIT Chapra',
      bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
      registrationOpen: data.registrationOpen ?? true,
      registrationDeadline: data.registrationDeadline,
      capacity: data.capacity || 100,
      registeredCount: data.registeredCount || 0,
      prerequisites: data.prerequisites || [],
      agenda: data.agenda || [],
      speakers: data.speakers || [],
      prizePool: data.prizePool,
      isFeatured: data.isFeatured ?? false
    };
    memEvents.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new EventModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Event] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateEvent: async (id: string, update: Partial<IEvent>): Promise<IEvent | null> => {
    const idx = memEvents.findIndex(e => e.id === id);
    if (idx !== -1) memEvents[idx] = { ...memEvents[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await EventModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IEvent;
      } catch (e) {
        console.warn('[DB Event] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memEvents[idx] : null;
  },
  deleteEvent: async (id: string): Promise<boolean> => {
    memEvents = memEvents.filter(e => e.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await EventModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Event] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // EVENT REGISTRATIONS
  getEventRegistrations: async (filter: Record<string, any> = {}): Promise<IEventRegistration[]> => {
    if (isMongoConnected()) {
      try {
        const items = await EventRegistrationModel.find(filter).sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IEventRegistration[];
      } catch (e) {
        console.warn('[DB Regs] Fallback:', (e as any).message);
      }
    }
    return memEventRegistrations.filter(r => {
      for (const key of Object.keys(filter)) {
        if ((r as any)[key] !== filter[key]) return false;
      }
      return true;
    });
  },
  findEventRegistration: async (eventId: string, email: string): Promise<IEventRegistration | null> => {
    const cleanEmail = email.trim().toLowerCase();
    if (isMongoConnected()) {
      try {
        const item = await EventRegistrationModel.findOne({ eventId, email: cleanEmail }).lean();
        if (item) return item as unknown as IEventRegistration;
      } catch (e) {
        console.warn('[DB Regs] findEventRegistration fallback:', (e as any).message);
      }
    }
    return memEventRegistrations.find(r => r.eventId === eventId && r.email?.toLowerCase() === cleanEmail) || null;
  },
  findEventRegistrationByUserId: async (eventId: string, userId: string): Promise<IEventRegistration | null> => {
    if (!userId) return null;
    if (isMongoConnected()) {
      try {
        const item = await EventRegistrationModel.findOne({ eventId, userId }).lean();
        if (item) return item as unknown as IEventRegistration;
      } catch (e) {
        console.warn('[DB Regs] findEventRegistrationByUserId fallback:', (e as any).message);
      }
    }
    return memEventRegistrations.find(r => r.eventId === eventId && r.userId === userId) || null;
  },
  createEventRegistration: async (data: Partial<IEventRegistration>): Promise<IEventRegistration> => {
    const id = data.id || `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const registrationId = data.registrationId || `EY-EVT-${Date.now().toString(36).toUpperCase()}`;
    const fullName = (data.fullName || data.name || '').trim();

    const item: IEventRegistration = {
      id,
      registrationId,
      eventId: data.eventId || '',
      eventTitle: data.eventTitle || '',
      userId: data.userId,
      name: fullName,
      fullName: fullName,
      email: (data.email || '').trim().toLowerCase(),
      phone: (data.phone || '').trim(),
      college: data.college || 'LNJPIT Chapra',
      rollNo: data.rollNo || data.rollNumber || '',
      rollNumber: data.rollNumber || data.rollNo || '',
      branch: data.branch || data.department || 'ECE',
      department: data.department || data.branch || 'Electronics & Communication Engineering',
      year: data.year || '3rd Year',
      teamName: data.teamName || '',
      teamMembers: data.teamMembers || [],
      experienceLevel: data.experienceLevel || 'Beginner',
      skillLevel: data.skillLevel || data.experienceLevel || 'Beginner',
      customFormResponses: data.customFormResponses || {},
      status: data.status || 'REGISTERED',
      attendance: data.attendance || 'PENDING',
      registeredAt: data.registeredAt || new Date().toISOString()
    };
    memEventRegistrations.unshift(item);

    // Increment event counter
    const evt = memEvents.find(e => e.id === item.eventId);
    if (evt) evt.registeredCount = (evt.registeredCount || 0) + 1;

    if (isMongoConnected()) {
      try {
        const doc = new EventRegistrationModel(item);
        await doc.save();
        if (item.eventId) {
          await EventModel.updateOne({ id: item.eventId }, { $inc: { registeredCount: 1 } });
        }
      } catch (e) {
        console.warn('[DB Reg] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateEventRegistration: async (id: string, update: Partial<IEventRegistration>): Promise<IEventRegistration | null> => {
    const idx = memEventRegistrations.findIndex(r => r.id === id);
    if (idx !== -1) memEventRegistrations[idx] = { ...memEventRegistrations[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await EventRegistrationModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IEventRegistration;
      } catch (e) {
        console.warn('[DB Reg] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memEventRegistrations[idx] : null;
  },
  deleteEventRegistration: async (id: string): Promise<boolean> => {
    const reg = memEventRegistrations.find(r => r.id === id);
    if (reg && reg.eventId) {
      const evt = memEvents.find(e => e.id === reg.eventId);
      if (evt && evt.registeredCount && evt.registeredCount > 0) evt.registeredCount -= 1;
    }
    memEventRegistrations = memEventRegistrations.filter(r => r.id !== id);

    if (isMongoConnected()) {
      try {
        if (reg && reg.eventId) {
          await EventModel.updateOne({ id: reg.eventId }, { $inc: { registeredCount: -1 } });
        }
        const res = await EventRegistrationModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Reg] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // JOIN APPLICATIONS
  getApplications: async (filter: Record<string, any> = {}): Promise<IJoinApplication[]> => {
    if (isMongoConnected()) {
      try {
        const items = await JoinApplicationModel.find(filter).sort({ submittedAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IJoinApplication[];
      } catch (e) {
        console.warn('[DB Apps] Fallback:', (e as any).message);
      }
    }
    return memApplications;
  },
  findApplicationById: async (id: string): Promise<IJoinApplication | null> => {
    if (isMongoConnected()) {
      try {
        const item = await JoinApplicationModel.findOne({ id }).lean();
        if (item) return item as unknown as IJoinApplication;
      } catch (e) {
        console.warn('[DB App] Fallback:', (e as any).message);
      }
    }
    return memApplications.find(a => a.id === id) || null;
  },
  createApplication: async (data: Partial<IJoinApplication>): Promise<IJoinApplication> => {
    const item: IJoinApplication = {
      id: data.id || `app-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      rollNo: data.rollNo || '',
      branch: data.branch || 'ECE',
      year: data.year || '1st Year',
      primaryDomain: data.primaryDomain || 'Robotics',
      secondaryDomain: data.secondaryDomain,
      experienceLevel: data.experienceLevel || 'Beginner',
      skills: data.skills || [],
      statementOfPurpose: data.statementOfPurpose || '',
      pastProjects: data.pastProjects,
      githubProfile: data.githubProfile,
      linkedinProfile: data.linkedinProfile,
      status: data.status || 'Pending',
      submittedAt: data.submittedAt || new Date().toISOString()
    };
    memApplications.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new JoinApplicationModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB App] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateApplication: async (id: string, update: Partial<IJoinApplication>): Promise<IJoinApplication | null> => {
    const idx = memApplications.findIndex(a => a.id === id);
    if (idx !== -1) memApplications[idx] = { ...memApplications[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await JoinApplicationModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IJoinApplication;
      } catch (e) {
        console.warn('[DB App] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memApplications[idx] : null;
  },
  deleteApplication: async (id: string): Promise<boolean> => {
    memApplications = memApplications.filter(a => a.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await JoinApplicationModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB App] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // GALLERY
  getGallery: async (filter: Record<string, any> = {}): Promise<IGalleryItem[]> => {
    if (isMongoConnected()) {
      try {
        const items = await GalleryModel.find(filter).sort({ date: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IGalleryItem[];
      } catch (e) {
        console.warn('[DB Gallery] Fallback:', (e as any).message);
      }
    }
    return memGallery;
  },
  createGalleryItem: async (data: Partial<IGalleryItem>): Promise<IGalleryItem> => {
    const item: IGalleryItem = {
      id: data.id || `gal-${Date.now()}`,
      title: data.title || '',
      category: data.category || 'Lab',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      description: data.description,
      date: data.date || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? false
    };
    memGallery.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new GalleryModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Gallery] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  deleteGalleryItem: async (id: string): Promise<boolean> => {
    memGallery = memGallery.filter(g => g.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await GalleryModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Gallery] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // BLOG POSTS
  getBlogPosts: async (filter: Record<string, any> = {}): Promise<IBlogPost[]> => {
    if (isMongoConnected()) {
      try {
        const items = await BlogPostModel.find(filter).sort({ publishDate: -1, createdAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IBlogPost[];
      } catch (e) {
        console.warn('[DB Blog] Fallback:', (e as any).message);
      }
    }
    return memBlog;
  },
  findBlogPostByIdOrSlug: async (param: string): Promise<IBlogPost | null> => {
    if (isMongoConnected()) {
      try {
        const item = await BlogPostModel.findOne({ $or: [{ id: param }, { slug: param }] }).lean();
        if (item) return item as unknown as IBlogPost;
      } catch (e) {
        console.warn('[DB Blog] Fallback:', (e as any).message);
      }
    }
    return memBlog.find(b => b.id === param || b.slug === param) || null;
  },
  createBlogPost: async (data: Partial<IBlogPost>): Promise<IBlogPost> => {
    const item: IBlogPost = {
      id: data.id || `blog-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || `post-${Date.now()}`,
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      author: data.author || 'e-Yantra Team',
      authorRole: data.authorRole || 'Contributor',
      publishDate: data.publishDate || new Date().toISOString().split('T')[0],
      readTime: data.readTime || '5 min read',
      category: data.category || 'Article',
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? false,
      views: data.views || 0
    };
    memBlog.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new BlogPostModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Blog] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateBlogPost: async (id: string, update: Partial<IBlogPost>): Promise<IBlogPost | null> => {
    const idx = memBlog.findIndex(b => b.id === id);
    if (idx !== -1) memBlog[idx] = { ...memBlog[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await BlogPostModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IBlogPost;
      } catch (e) {
        console.warn('[DB Blog] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memBlog[idx] : null;
  },
  deleteBlogPost: async (id: string): Promise<boolean> => {
    memBlog = memBlog.filter(b => b.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await BlogPostModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Blog] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },
  incrementBlogViews: async (param: string): Promise<void> => {
    const post = memBlog.find(b => b.id === param || b.slug === param);
    if (post) post.views = (post.views || 0) + 1;

    if (isMongoConnected()) {
      try {
        await BlogPostModel.updateOne({ $or: [{ id: param }, { slug: param }] }, { $inc: { views: 1 } });
      } catch (e) {
        console.warn('[DB Blog] View counter fallback:', (e as any).message);
      }
    }
  },

  // ACHIEVEMENTS
  getAchievements: async (): Promise<IAchievement[]> => {
    if (isMongoConnected()) {
      try {
        const items = await AchievementModel.find().sort({ date: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IAchievement[];
      } catch (e) {
        console.warn('[DB Achievements] Fallback:', (e as any).message);
      }
    }
    return memAchievements;
  },
  createAchievement: async (data: Partial<IAchievement>): Promise<IAchievement> => {
    const item: IAchievement = {
      id: data.id || `ach-${Date.now()}`,
      title: data.title || '',
      competition: data.competition || '',
      organizer: data.organizer,
      date: data.date || '2026',
      rank: data.rank || 'Finalist',
      teamMembers: data.teamMembers || [],
      description: data.description || '',
      photoUrl: data.photoUrl,
      isFeatured: data.isFeatured ?? false
    };
    memAchievements.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new AchievementModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Achievement] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  deleteAchievement: async (id: string): Promise<boolean> => {
    memAchievements = memAchievements.filter(a => a.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await AchievementModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Achievement] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // RESOURCES
  getResources: async (filter: Record<string, any> = {}): Promise<ILearningResource[]> => {
    if (isMongoConnected()) {
      try {
        const items = await ResourceModel.find(filter).sort({ addedDate: -1 }).lean();
        if (items && items.length > 0) return items as unknown as ILearningResource[];
      } catch (e) {
        console.warn('[DB Resources] Fallback:', (e as any).message);
      }
    }
    return memResources;
  },
  createResource: async (data: Partial<ILearningResource>): Promise<ILearningResource> => {
    const item: ILearningResource = {
      id: data.id || `res-${Date.now()}`,
      title: data.title || '',
      category: data.category || 'General',
      description: data.description || '',
      difficulty: data.difficulty || 'Beginner',
      link: data.link || '',
      type: data.type || 'Guide',
      tags: data.tags || [],
      addedDate: data.addedDate || new Date().toISOString().split('T')[0]
    };
    memResources.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new ResourceModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Resource] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  deleteResource: async (id: string): Promise<boolean> => {
    memResources = memResources.filter(r => r.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await ResourceModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Resource] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // CONTACT MESSAGES
  getContactMessages: async (): Promise<IContactMessage[]> => {
    if (isMongoConnected()) {
      try {
        const items = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as IContactMessage[];
      } catch (e) {
        console.warn('[DB Contact] Fallback:', (e as any).message);
      }
    }
    return memContactMessages;
  },
  createContactMessage: async (data: Partial<IContactMessage>): Promise<IContactMessage> => {
    const item: IContactMessage = {
      id: data.id || `msg-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      subject: data.subject || '',
      message: data.message || '',
      status: data.status || 'Unread',
      createdAt: data.createdAt || new Date().toISOString()
    };
    memContactMessages.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new ContactMessageModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Contact] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  updateContactMessage: async (id: string, update: Partial<IContactMessage>): Promise<IContactMessage | null> => {
    const idx = memContactMessages.findIndex(m => m.id === id);
    if (idx !== -1) memContactMessages[idx] = { ...memContactMessages[idx], ...update };

    if (isMongoConnected()) {
      try {
        const doc = await ContactMessageModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
        if (doc) return doc as unknown as IContactMessage;
      } catch (e) {
        console.warn('[DB Contact] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memContactMessages[idx] : null;
  },
  deleteContactMessage: async (id: string): Promise<boolean> => {
    memContactMessages = memContactMessages.filter(m => m.id !== id);
    if (isMongoConnected()) {
      try {
        const res = await ContactMessageModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (e) {
        console.warn('[DB Contact] Delete fallback:', (e as any).message);
      }
    }
    return true;
  },

  // NOTIFICATIONS
  getNotifications: async (filter: Record<string, any> = {}): Promise<INotification[]> => {
    if (isMongoConnected()) {
      try {
        const items = await NotificationModel.find(filter).sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) return items as unknown as INotification[];
      } catch (e) {
        console.warn('[DB Notifications] Fallback:', (e as any).message);
      }
    }
    return memNotifications;
  },
  createNotification: async (data: Partial<INotification>): Promise<INotification> => {
    const item: INotification = {
      id: data.id || `notif-${Date.now()}`,
      title: data.title || '',
      message: data.message || '',
      type: data.type || 'info',
      targetRole: data.targetRole || 'ALL',
      targetUser: data.targetUser,
      link: data.link,
      isRead: data.isRead ?? false,
      createdAt: data.createdAt || new Date().toISOString()
    };
    memNotifications.unshift(item);

    if (isMongoConnected()) {
      try {
        const doc = new NotificationModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Notification] Save fallback:', (e as any).message);
      }
    }
    return item;
  },
  markNotificationRead: async (id: string): Promise<INotification | null> => {
    const idx = memNotifications.findIndex(n => n.id === id);
    if (idx !== -1) memNotifications[idx].isRead = true;

    if (isMongoConnected()) {
      try {
        const doc = await NotificationModel.findOneAndUpdate({ id }, { $set: { isRead: true } }, { new: true }).lean();
        if (doc) return doc as unknown as INotification;
      } catch (e) {
        console.warn('[DB Notification] Update fallback:', (e as any).message);
      }
    }
    return idx !== -1 ? memNotifications[idx] : null;
  },

  // AUDIT LOGS
  getAuditLogs: async (): Promise<IAuditLog[]> => {
    if (isMongoConnected()) {
      try {
        const items = await AuditLogModel.find().sort({ timestamp: -1 }).limit(100).lean();
        if (items && items.length > 0) return items as unknown as IAuditLog[];
      } catch (e) {
        console.warn('[DB Audit] Fallback:', (e as any).message);
      }
    }
    return memAuditLogs;
  },
  addAuditLog: async (logData: { user: string; userId?: string; role?: string; userRole?: string; action: string; targetRecord: string; details?: any }): Promise<IAuditLog> => {
    const item: IAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user: logData.user,
      userId: logData.userId,
      role: logData.role || logData.userRole || 'USER',
      userRole: logData.userRole || logData.role || 'USER',
      action: logData.action,
      targetRecord: logData.targetRecord,
      details: logData.details || {},
      timestamp: new Date().toISOString()
    };
    memAuditLogs.unshift(item);
    if (memAuditLogs.length > 200) memAuditLogs.pop();

    if (isMongoConnected()) {
      try {
        const doc = new AuditLogModel(item);
        await doc.save();
      } catch (e) {
        console.warn('[DB Audit] Save fallback:', (e as any).message);
      }
    }
    return item;
  },

  // SETTINGS
  getSettings: async (): Promise<ISettings> => {
    if (isMongoConnected()) {
      try {
        const s = await SettingsModel.findOne().lean();
        if (s) return s as unknown as ISettings;
      } catch (e) {
        console.warn('[DB Settings] Fallback:', (e as any).message);
      }
    }
    return memSettings;
  },
  updateSettings: async (data: Partial<ISettings>): Promise<ISettings> => {
    memSettings = { ...memSettings, ...data };

    if (isMongoConnected()) {
      try {
        const updated = await SettingsModel.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true }).lean();
        if (updated) return updated as unknown as ISettings;
      } catch (e) {
        console.warn('[DB Settings] Update fallback:', (e as any).message);
      }
    }
    return memSettings;
  },
  getFAQs: async () => {
    const s = await db.getSettings();
    return s?.faqs || memSettings.faqs;
  },
  getTestimonials: async () => {
    const s = await db.getSettings();
    return s?.testimonials || memSettings.testimonials;
  }
};

export default db;
