import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';
import { Role, Level, PaymentStatus } from '@prisma/client';

export async function autoSeedDatabase() {
  try {
    console.log('Verifying default user credentials...');
    
    // 1. Force verify/restore Default Users credentials (always runs)
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const instructorPasswordHash = await bcrypt.hash('instructor123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@cloudforge.com' },
      update: {
        name: 'Alex Mercer (Admin)',
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
      create: {
        email: 'admin@cloudforge.com',
        name: 'Alex Mercer (Admin)',
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      },
    });

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@cloudforge.com' },
      update: {
        name: 'Nana Janashia (Instructor)',
        passwordHash: instructorPasswordHash,
        role: Role.INSTRUCTOR,
      },
      create: {
        email: 'instructor@cloudforge.com',
        name: 'Nana Janashia (Instructor)',
        passwordHash: instructorPasswordHash,
        role: Role.INSTRUCTOR,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
        streakCount: 5,
      },
    });

    const student = await prisma.user.upsert({
      where: { email: 'student@cloudforge.com' },
      update: {
        name: 'Sarah Connor (Student)',
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
      },
      create: {
        email: 'student@cloudforge.com',
        name: 'Sarah Connor (Student)',
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
        streakCount: 3,
      },
    });

    console.log('Default user records verified.');

    // 2. Create Categories
    const categoryNames = [
      { name: 'AWS', slug: 'aws', description: 'Amazon Web Services cloud solutions.' },
      { name: 'Azure', slug: 'azure', description: 'Microsoft Azure cloud computing.' },
      { name: 'Google Cloud', slug: 'google-cloud', description: 'Google Cloud Platform (GCP).' },
      { name: 'Docker', slug: 'docker', description: 'Containerization and packaging software.' },
      { name: 'Kubernetes', slug: 'kubernetes', description: 'Enterprise-grade orchestration of containers.' },
      { name: 'Terraform', slug: 'terraform', description: 'Infrastructure as Code (IaC).' },
      { name: 'Jenkins', slug: 'jenkins', description: 'Continuous Integration / Delivery.' },
      { name: 'GitHub Actions', slug: 'github-actions', description: 'CI/CD automation pipelines.' },
      { name: 'Linux', slug: 'linux', description: 'Linux operations and scripting.' },
      { name: 'DevOps', slug: 'devops', description: 'DevOps methodologies.' },
      { name: 'AI & Machine Learning', slug: 'ai-ml', description: 'Machine learning algorithms.' },
      { name: 'Generative AI', slug: 'generative-ai', description: 'LLMs and prompt engineering.' },
      { name: 'Python', slug: 'python', description: 'Python programming.' },
      { name: 'Java', slug: 'java', description: 'Enterprise backend development.' },
      { name: 'JavaScript', slug: 'javascript', description: 'JavaScript frameworks.' },
      { name: 'React', slug: 'react', description: 'React UI libraries.' },
      { name: 'Next.js', slug: 'next-js', description: 'Next.js meta-framework.' },
      { name: 'Node.js', slug: 'node-js', description: 'REST APIs with Node.' },
      { name: 'System Design', slug: 'system-design', description: 'High availability systems design.' },
      { name: 'Data Structures & Algorithms', slug: 'dsa', description: 'Data structures training.' },
      { name: 'Cyber Security', slug: 'cyber-security', description: 'Penetration testing.' },
      { name: 'Data Science', slug: 'data-science', description: 'Data science structures.' },
    ];

    const categoriesMap: Record<string, string> = {};
    for (const cat of categoryNames) {
      const createdCat = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      categoriesMap[cat.name] = createdCat.id;
    }

    console.log('Categories verified.');

    // 3. Create Courses (Conditional on courseCount === 0)
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      console.log('Seeding courses...');
      
      // Course 1: Kubernetes Masterclass
      const k8sCourse = await prisma.course.create({
        data: {
          title: 'Kubernetes Masterclass for DevOps Engineers',
          subtitle: 'Go from zero to production-grade Kubernetes administrator with real-world scenarios.',
          description: 'Master Kubernetes orchestration from the ground up. You will learn architecture components (Pods, Deployments, Services, ConfigMaps, Secrets), Ingress Controllers, Persistent Volumes, Helm charts, and how to scale applications dynamically in production cluster environments.',
          requirements: ['Basic understanding of Linux commands', 'Familiarity with container concepts like Docker'],
          level: Level.INTERMEDIATE,
          price: 94.99,
          imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
          promoVideoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k',
          rating: 4.8,
          published: true,
          categoryId: categoriesMap['Kubernetes'],
          instructorId: instructor.id,
          sections: {
            create: [
              {
                title: 'Introduction to Containers & Orchestration',
                sortOrder: 1,
                lessons: {
                  create: [
                    {
                      title: 'Welcome to CloudForge Academy K8s Path',
                      videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=0',
                      duration: 600,
                      content: 'In this intro lesson, we outline what Kubernetes is, why it became the industry standard, and what you will build by the end of this masterclass.',
                      sortOrder: 1,
                      isFreePreview: true,
                    },
                    {
                      title: 'Why Kubernetes? Orchestration Solved',
                      videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=600',
                      duration: 900,
                      content: 'Understand container pain points: autoscaling, zero-downtime rollouts, health checks, and service discovery, and how K8s resolves them all.',
                      sortOrder: 2,
                      isFreePreview: true,
                    }
                  ]
                }
              },
              {
                title: 'Core Architecture Components',
                sortOrder: 2,
                lessons: {
                  create: [
                    {
                      title: 'Master and Worker Nodes Explained',
                      videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=1500',
                      duration: 1200,
                      content: 'Dive deep into kube-apiserver, etcd database, kube-scheduler, kube-controller-manager, kubelet service, and kube-proxy.',
                      sortOrder: 1,
                      isFreePreview: false,
                    },
                    {
                      title: 'Pods, Deployments, and Services configuration',
                      videoUrl: 'https://www.youtube.com/embed/VnvRFRk_51k?start=2700',
                      duration: 1800,
                      content: 'Learn how to write YAML manifests for Pods, replicate them via Deployments, and expose them to internal and external clients using Services (ClusterIP, NodePort, LoadBalancer).',
                      sortOrder: 2,
                      isFreePreview: false,
                    }
                  ]
                }
              }
            ]
          }
        }
      });

      // Course 2: Docker Masterclass
      const dockerCourse = await prisma.course.create({
        data: {
          title: 'Docker & Containerization Bootcamp',
          subtitle: 'Package, run, and scale applications in isolated containers using Docker and Docker Compose.',
          description: 'The definitive guide to container technologies. Learn Docker CLI, Dockerfile instructions (FROM, RUN, CMD, COPY, EXPOSE), container networking, storage volumes, env variables, multi-stage builds, and multi-container setups using Docker Compose.',
          requirements: ['Basic command line usage', 'Familiarity with any coding language'],
          level: Level.BEGINNER,
          price: 49.99,
          imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
          promoVideoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc',
          rating: 4.7,
          published: true,
          categoryId: categoriesMap['Docker'],
          instructorId: instructor.id,
          sections: {
            create: [
              {
                title: 'Containerization Basics',
                sortOrder: 1,
                lessons: {
                  create: [
                    {
                      title: 'What is a Container vs Virtual Machine?',
                      videoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc?start=0',
                      duration: 800,
                      content: 'Understand OS-level virtualization. Learn how containers share the host kernel making them light, fast, and highly portable compared to hypervisor-based Virtual Machines.',
                      sortOrder: 1,
                      isFreePreview: true,
                    },
                    {
                      title: 'Installing Docker & Running Your First Container',
                      videoUrl: 'https://www.youtube.com/embed/3c-iKanqdEc?start=800',
                      duration: 1000,
                      content: 'Run `docker run hello-world` and explore what happens under the hood. Learn basic container logs, start, stop, and inspect commands.',
                      sortOrder: 2,
                      isFreePreview: true,
                    }
                  ]
                }
              }
            ]
          }
        }
      });

      // Course 3: System Design Fundamentals
      const sysDesignCourse = await prisma.course.create({
        data: {
          title: 'System Design for Large Scale Web Applications',
          subtitle: 'Learn how to architect systems supporting millions of concurrent users.',
          description: 'Understand core architectural concepts: horizontal scaling, load balancers, database replication/sharding, caching layers (Redis, Memcached), CDN distribution, messaging brokers (Kafka, RabbitMQ), microservices design, and CAP theorem.',
          requirements: ['At least 1 year of programming experience', 'Understanding of basic HTTP web architectures'],
          level: Level.ADVANCED,
          price: 119.99,
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
          promoVideoUrl: 'https://www.youtube.com/embed/m8I0fD_A6XU',
          rating: 4.9,
          published: true,
          categoryId: categoriesMap['System Design'],
          instructorId: instructor.id,
          sections: {
            create: [
              {
                title: 'Scaling from Single Users to Millions',
                sortOrder: 1,
                lessons: {
                  create: [
                    {
                      title: 'Horizontal vs Vertical Scaling & Load Balancers',
                      videoUrl: 'https://www.youtube.com/embed/m8I0fD_A6XU?start=0',
                      duration: 900,
                      content: 'Explore scaling options. Learn DNS routing, hardware/software Load Balancers (HAProxy, Nginx), and how they distribute traffic across application servers.',
                      sortOrder: 1,
                      isFreePreview: true,
                    }
                  ]
                }
              }
            ]
          }
        }
      });

      // Create reviews
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Absolutely amazing! Best Kubernetes tutorial ever made. Highly detailed.',
          userId: student.id,
          courseId: k8sCourse.id,
        }
      });

      // Enroll student in K8s course to simulate progress
      const k8sEnrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: k8sCourse.id,
          progress: 50,
        }
      });

      const k8sLessons = await prisma.lesson.findMany({
        where: { section: { courseId: k8sCourse.id } },
        orderBy: { sortOrder: 'asc' },
      });

      if (k8sLessons.length > 0) {
        await prisma.lessonProgress.create({
          data: {
            enrollmentId: k8sEnrollment.id,
            lessonId: k8sLessons[0].id,
            completed: true,
            completedAt: new Date(),
          }
        });
      }

      // Add Docker to Wishlist
      await prisma.wishlist.create({
        data: {
          userId: student.id,
          courseId: dockerCourse.id,
        }
      });

      // Payments ledger
      await prisma.payment.create({
        data: {
          amount: 94.99,
          transactionId: 'TXN-AUTO-' + Math.floor(Math.random() * 100000000),
          status: PaymentStatus.COMPLETED,
          userId: student.id,
          courseId: k8sCourse.id,
        }
      });

      console.log('Database successfully auto-seeded!');
    } else {
      console.log('Courses already exist in database. Skipping course seed.');
    }
  } catch (error) {
    console.error('Failed to run database auto-seed:', error);
  }
}
