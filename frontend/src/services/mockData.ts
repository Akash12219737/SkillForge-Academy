export interface MockCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  requirements: string[];
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  imageUrl: string;
  promoVideoUrl: string;
  rating: number;
  published: boolean;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  sections: {
    id: string;
    title: string;
    sortOrder: number;
    lessons: {
      id: string;
      title: string;
      videoUrl: string;
      duration: number;
      content: string;
      sortOrder: number;
      isFreePreview: boolean;
    }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string;
      avatarUrl: string;
    };
  }[];
}

// 22 Categories matching backend
export const mockCategories = [
  { id: 'cat-aws', name: 'AWS', slug: 'aws', description: 'AWS solutions.' },
  { id: 'cat-azure', name: 'Azure', slug: 'azure', description: 'Azure certifications.' },
  { id: 'cat-gcp', name: 'Google Cloud', slug: 'google-cloud', description: 'GCP configurations.' },
  { id: 'cat-docker', name: 'Docker', slug: 'docker', description: 'Container setups.' },
  { id: 'cat-k8s', name: 'Kubernetes', slug: 'kubernetes', description: 'Container orchestrations.' },
  { id: 'cat-terraform', name: 'Terraform', slug: 'terraform', description: 'Infrastructure as Code.' },
  { id: 'cat-jenkins', name: 'Jenkins', slug: 'jenkins', description: 'Automation pipelines.' },
  { id: 'cat-gha', name: 'GitHub Actions', slug: 'github-actions', description: 'GitHub CI/CD workflows.' },
  { id: 'cat-linux', name: 'Linux', slug: 'linux', description: 'Linux operations.' },
  { id: 'cat-devops', name: 'DevOps', slug: 'devops', description: 'DevOps methodologies.' },
  { id: 'cat-ai-ml', name: 'AI & Machine Learning', slug: 'ai-ml', description: 'AI/ML algorithms.' },
  { id: 'cat-genai', name: 'Generative AI', slug: 'generative-ai', description: 'LLMs & prompt engineering.' },
  { id: 'cat-python', name: 'Python', slug: 'python', description: 'Python coding.' },
  { id: 'cat-java', name: 'Java', slug: 'java', description: 'Enterprise backend development.' },
  { id: 'cat-js', name: 'JavaScript', slug: 'javascript', description: 'JS frameworks.' },
  { id: 'cat-react', name: 'React', slug: 'react', description: 'Component-driven interactive UI libraries.' },
  { id: 'cat-next', name: 'Next.js', slug: 'next-js', description: 'Next.js meta-frameworks.' },
  { id: 'cat-node', name: 'Node.js', slug: 'node-js', description: 'REST APIs.' },
  { id: 'cat-sysdesign', name: 'System Design', slug: 'system-design', description: 'High availability systems.' },
  { id: 'cat-dsa', name: 'Data Structures & Algorithms', slug: 'dsa', description: 'LeetCode challenges.' },
  { id: 'cat-cyber', name: 'Cyber Security', slug: 'cyber-security', description: 'Threat protections.' },
  { id: 'cat-datascience', name: 'Data Science', slug: 'data-science', description: 'Data modeling.' },
];

export const defaultMockCourses: MockCourse[] = [
  {
    id: 'course-k8s',
    title: 'Kubernetes Masterclass for DevOps Engineers',
    subtitle: 'Go from zero to production-grade Kubernetes administrator with real-world scenarios.',
    description: 'Master Kubernetes orchestration from the ground up. You will learn architecture components (Pods, Deployments, Services, ConfigMaps, Secrets), Ingress Controllers, Persistent Volumes, Helm charts, and how to scale applications dynamically in production cluster environments.',
    requirements: ['Basic understanding of Linux commands', 'Familiarity with container concepts like Docker'],
    level: 'INTERMEDIATE',
    price: 94.99,
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    promoVideoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k',
    rating: 4.8,
    published: true,
    categoryId: 'cat-k8s',
    categoryName: 'Kubernetes',
    categorySlug: 'kubernetes',
    instructorId: 'inst-nana',
    instructorName: 'Nana Janashia',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    sections: [
      {
        id: 'sec-k8s-1',
        title: 'Introduction to Containers & Orchestration',
        sortOrder: 1,
        lessons: [
          {
            id: 'les-k8s-1',
            title: 'Welcome to CloudForge Academy K8s Path',
            videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=0',
            duration: 600,
            content: 'In this intro lesson, we outline what Kubernetes is, why it became the industry standard, and what you will build by the end of this masterclass.',
            sortOrder: 1,
            isFreePreview: true,
          },
          {
            id: 'les-k8s-2',
            title: 'Why Kubernetes? Orchestration Solved',
            videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=600',
            duration: 900,
            content: 'Understand container pain points: autoscaling, zero-downtime rollouts, health checks, and service discovery, and how K8s resolves them all.',
            sortOrder: 2,
            isFreePreview: true,
          }
        ]
      },
      {
        id: 'sec-k8s-2',
        title: 'Core Architecture Components',
        sortOrder: 2,
        lessons: [
          {
            id: 'les-k8s-3',
            title: 'Master and Worker Nodes Explained',
            videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=1500',
            duration: 1200,
            content: 'Dive deep into kube-apiserver, etcd database, kube-scheduler, kube-controller-manager, kubelet service, and kube-proxy.',
            sortOrder: 1,
            isFreePreview: false,
          },
          {
            id: 'les-k8s-4',
            title: 'Pods, Deployments, and Services configuration',
            videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=2700',
            duration: 1800,
            content: 'Learn how to write YAML manifests for Pods, replicate them via Deployments, and expose them to internal and external clients using Services (ClusterIP, NodePort, LoadBalancer).',
            sortOrder: 2,
            isFreePreview: false,
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-k8s-1',
        rating: 5,
        comment: 'Absolutely amazing! Best Kubernetes tutorial ever made. Highly detailed.',
        createdAt: '2026-06-20T12:00:00.000Z',
        user: {
          name: 'Sarah Connor',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        }
      }
    ]
  },
  {
    id: 'course-docker',
    title: 'Docker & Containerization Bootcamp',
    subtitle: 'Package, run, and scale applications in isolated containers using Docker and Docker Compose.',
    description: 'The definitive guide to container technologies. Learn Docker CLI, Dockerfile instructions (FROM, RUN, CMD, COPY, EXPOSE), container networking, storage volumes, env variables, multi-stage builds, and multi-container setups using Docker Compose.',
    requirements: ['Basic command line usage', 'Familiarity with any coding language'],
    level: 'BEGINNER',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
    promoVideoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc',
    rating: 4.7,
    published: true,
    categoryId: 'cat-docker',
    categoryName: 'Docker',
    categorySlug: 'docker',
    instructorId: 'inst-nana',
    instructorName: 'Nana Janashia',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    sections: [
      {
        id: 'sec-doc-1',
        title: 'Containerization Basics',
        sortOrder: 1,
        lessons: [
          {
            id: 'les-doc-1',
            title: 'What is a Container vs Virtual Machine?',
            videoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc?start=0',
            duration: 800,
            content: 'Understand OS-level virtualization. Learn how containers share the host kernel making them light, fast, and highly portable compared to hypervisor-based Virtual Machines.',
            sortOrder: 1,
            isFreePreview: true,
          },
          {
            id: 'les-doc-2',
            title: 'Installing Docker & Running Your First Container',
            videoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc?start=800',
            duration: 1000,
            content: 'Run `docker run hello-world` and explore what happens under the hood. Learn basic container logs, start, stop, and inspect commands.',
            sortOrder: 2,
            isFreePreview: true,
          }
        ]
      }
    ],
    reviews: []
  },
  {
    id: 'course-sysdesign',
    title: 'System Design for Large Scale Web Applications',
    subtitle: 'Learn how to architect systems supporting millions of concurrent users.',
    description: 'Understand core architectural concepts: horizontal scaling, load balancers, database replication/sharding, caching layers (Redis, Memcached), CDN distribution, messaging brokers (Kafka, RabbitMQ), microservices design, and CAP theorem.',
    requirements: ['At least 1 year of programming experience', 'Understanding of basic HTTP web architectures'],
    level: 'ADVANCED',
    price: 119.99,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    promoVideoUrl: 'https://www.youtube.com/embed/m8I0fD_A6XU',
    rating: 4.9,
    published: true,
    categoryId: 'cat-sysdesign',
    categoryName: 'System Design',
    categorySlug: 'system-design',
    instructorId: 'inst-nana',
    instructorName: 'Nana Janashia',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    sections: [
      {
        id: 'sec-sys-1',
        title: 'Scaling from Single Users to Millions',
        sortOrder: 1,
        lessons: [
          {
            id: 'les-sys-1',
            title: 'Horizontal vs Vertical Scaling & Load Balancers',
            videoUrl: 'https://www.youtube.com/embed/m8I0fD_A6XU?start=0',
            duration: 900,
            content: 'Explore scaling options. Learn DNS routing, hardware/software Load Balancers (HAProxy, Nginx), and how they distribute traffic across application servers.',
            sortOrder: 1,
            isFreePreview: true,
          }
        ]
      }
    ],
    reviews: []
  }
];

export const mockUsers = [
  {
    id: 'usr-admin',
    email: 'admin@cloudforge.com',
    name: 'Alex Mercer (Admin)',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    streakCount: 12,
  },
  {
    id: 'usr-instructor',
    email: 'instructor@cloudforge.com',
    name: 'Nana Janashia (Instructor)',
    role: 'INSTRUCTOR',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    streakCount: 5,
  },
  {
    id: 'usr-student',
    email: 'student@cloudforge.com',
    name: 'Sarah Connor (Student)',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    streakCount: 3,
  }
];

// Helper to initialize local storage database states
export const initMockStorage = () => {
  if (!localStorage.getItem('cf_courses')) {
    localStorage.setItem('cf_courses', JSON.stringify(defaultMockCourses));
  }
  if (!localStorage.getItem('cf_users')) {
    localStorage.setItem('cf_users', JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem('cf_enrollments')) {
    // Auto enroll student in K8s
    localStorage.setItem(
      'cf_enrollments',
      JSON.stringify([
        {
          id: 'enr-mock-1',
          userId: 'usr-student',
          courseId: 'course-k8s',
          progress: 50,
          enrolledAt: new Date().toISOString(),
        },
      ])
    );
  }
  if (!localStorage.getItem('cf_lesson_progress')) {
    localStorage.setItem(
      'cf_lesson_progress',
      JSON.stringify([
        {
          id: 'lp-mock-1',
          enrollmentId: 'enr-mock-1',
          lessonId: 'les-k8s-1',
          completed: true,
          completedAt: new Date().toISOString(),
        },
      ])
    );
  }
  if (!localStorage.getItem('cf_wishlist')) {
    localStorage.setItem(
      'cf_wishlist',
      JSON.stringify([
        {
          id: 'w-mock-1',
          userId: 'usr-student',
          courseId: 'course-docker',
        },
      ])
    );
  }
  if (!localStorage.getItem('cf_payments')) {
    localStorage.setItem(
      'cf_payments',
      JSON.stringify([
        {
          id: 'pay-mock-1',
          amount: 94.99,
          transactionId: 'TXN-MOCK-984327493',
          status: 'COMPLETED',
          userId: 'usr-student',
          courseId: 'course-k8s',
          createdAt: new Date().toISOString(),
        },
      ])
    );
  }
  if (!localStorage.getItem('cf_certificates')) {
    localStorage.setItem('cf_certificates', JSON.stringify([]));
  }
  if (!localStorage.getItem('cf_notes')) {
    localStorage.setItem('cf_notes', JSON.stringify({}));
  }
};
