/* eslint-disable */
import {
  PrismaClient,
  UserRole,
  EmploymentType,
  ExperienceLevel,
  LocationType,
  JobStatus,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function main() {
  // Candidate user (Clerk-based)
  const candidateUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_candidate_123' },
    update: {},
    create: {
      clerkUserId: 'clerk_candidate_123',
      email: 'candidate@example.com',
      role: UserRole.CANDIDATE,
      candidateProfile: {
        create: {
          firstName: 'Michael',
          lastName: 'Akpuofoba',
          phone: '08000000000',
          bio: 'Backend developer learning deeply.',
          yearsOfExperience: 2,
          location: 'Lagos, Nigeria',
        },
      },
    },
    include: {
      candidateProfile: true,
    },
  });

  // Employer user (Clerk-based)
  const employerUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_employer_123' },
    update: {},
    create: {
      clerkUserId: 'clerk_employer_123',
      email: 'employer@example.com',
      role: UserRole.EMPLOYER,
      employerProfile: {
        create: {
          phone: '08011111111',
        },
      },
    },
    include: {
      employerProfile: true,
    },
  });

  if (!candidateUser.candidateProfile) {
    throw new Error('Candidate profile was not created.');
  }

  if (!employerUser.employerProfile) {
    throw new Error('Employer profile was not created.');
  }

  const candidateProfileId: string = candidateUser.candidateProfile.id;
  const employerProfileId: string = employerUser.employerProfile.id;

  // Company
  const company = await prisma.company.upsert({
    where: { slug: 'sainthr' },
    update: {},
    create: {
      employerProfileId,
      name: 'SaintHR',
      slug: 'sainthr',
      description: 'A hiring platform.',
      website: 'https://sainthr.dev',
      location: 'Lagos, Nigeria',
    },
  });

  // Job
  const job = await prisma.job.upsert({
    where: { slug: 'backend-engineer-level-1' },
    update: {},
    create: {
      companyId: company.id,
      title: 'Backend Engineer Level 1',
      slug: 'backend-engineer-level-1',
      description: 'Build APIs and backend systems.',
      requirements: 'NestJS, PostgreSQL, Redis',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.ENTRY,
      locationType: LocationType.HYBRID,
      city: 'Lagos',
      country: 'Nigeria',
      salaryMin: 300000,
      salaryMax: 500000,
      currency: 'NGN',
      status: JobStatus.OPEN,
    },
  });

  // Resume
  const resume = await prisma.resume.create({
    data: {
      candidateProfileId,
      fileUrl: 'https://files.example.com/resume.pdf',
      fileName: 'resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 200000,
      isPrimary: true,
    },
  });

  console.log('Seed complete 🚀');
  console.log({
    candidateUserId: candidateUser.clerkUserId,
    employerUserId: employerUser.clerkUserId,
    companyId: company.id,
    jobId: job.id,
    resumeId: resume.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
