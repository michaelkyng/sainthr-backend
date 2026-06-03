import {
  PrismaClient,
  UserRole,
  EmploymentType,
  ExperienceLevel,
  LocationType,
  JobStatus,
  JobApplicationStatus,
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

/**
 * Upsert append-only status-history rows by deterministic id so the seed is
 * idempotent (these rows have no natural unique key to match on otherwise).
 */
async function seedStatusHistory(
  entries: Array<{
    id: string;
    jobApplicationId: string;
    oldStatus: JobApplicationStatus | null;
    newStatus: JobApplicationStatus;
    changedByUserId: string;
    note?: string;
  }>,
) {
  for (const entry of entries) {
    await prisma.applicationStatusHistory.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }
}

async function main() {
  // ----------------------------------------------------------------------
  // Users (keyed on clerkUserId)
  // ----------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_admin_123' },
    update: {},
    create: {
      clerkUserId: 'clerk_admin_123',
      email: 'admin@sainthr.dev',
      roles: [UserRole.ADMIN],
    },
  });

  const employerUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_employer_123' },
    update: {},
    create: {
      clerkUserId: 'clerk_employer_123',
      email: 'employer@example.com',
      roles: [UserRole.EMPLOYER, UserRole.CANDIDATE],
    },
  });

  const employerUser2 = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_employer_456' },
    update: {},
    create: {
      clerkUserId: 'clerk_employer_456',
      email: 'hr@brightwave.io',
      roles: [UserRole.EMPLOYER],
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_candidate_123' },
    update: {},
    create: {
      clerkUserId: 'clerk_candidate_123',
      email: 'candidate@example.com',
      roles: [UserRole.CANDIDATE],
    },
  });

  const candidateUser2 = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_candidate_456' },
    update: {},
    create: {
      clerkUserId: 'clerk_candidate_456',
      email: 'grace@example.com',
      roles: [UserRole.CANDIDATE, UserRole.EMPLOYER],
    },
  });

  const candidateUser3 = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_candidate_789' },
    update: {},
    create: {
      clerkUserId: 'clerk_candidate_789',
      email: 'daniel@example.com',
      roles: [UserRole.CANDIDATE],
    },
  });

  // ----------------------------------------------------------------------
  // Profiles (keyed on userId -> User.clerkUserId)
  // ----------------------------------------------------------------------
  const employerProfile = await prisma.employerProfile.upsert({
    where: { userId: employerUser.clerkUserId },
    update: {},
    create: {
      userId: employerUser.clerkUserId,
      phone: '08011111111',
      isOnboarded: true,
    },
  });

  const employerProfile2 = await prisma.employerProfile.upsert({
    where: { userId: employerUser2.clerkUserId },
    update: {},
    create: {
      userId: employerUser2.clerkUserId,
      phone: '08022222222',
      isOnboarded: true,
    },
  });

  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.clerkUserId },
    update: {},
    create: {
      userId: candidateUser.clerkUserId,
      firstName: 'Michael',
      lastName: 'Akpuofoba',
      phone: '08000000000',
      bio: 'Backend developer learning deeply.',
      yearsOfExperience: 2,
      location: 'Lagos, Nigeria',
      isOnboarded: true,
    },
  });

  const candidateProfile2 = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser2.clerkUserId },
    update: {},
    create: {
      userId: candidateUser2.clerkUserId,
      firstName: 'Grace',
      lastName: 'Okafor',
      phone: '08033333333',
      bio: 'Frontend engineer who loves design systems.',
      yearsOfExperience: 5,
      location: 'Abuja, Nigeria',
      isOnboarded: true,
    },
  });

  const candidateProfile3 = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser3.clerkUserId },
    update: {},
    create: {
      userId: candidateUser3.clerkUserId,
      firstName: 'Daniel',
      lastName: 'Mensah',
      phone: '08044444444',
      bio: 'Platform engineer focused on reliability and DevOps.',
      yearsOfExperience: 8,
      location: 'Accra, Ghana',
      isOnboarded: true,
    },
  });

  // Dual-role users: each has a profile backing their second role.
  // Tunde is primarily an EMPLOYER but also job-hunts as a CANDIDATE.
  await prisma.candidateProfile.upsert({
    where: { userId: employerUser.clerkUserId },
    update: {},
    create: {
      userId: employerUser.clerkUserId,
      firstName: 'Tunde',
      lastName: 'Adewale',
      phone: '08055555555',
      bio: 'Recruiter at SaintHR, also exploring new backend roles.',
      yearsOfExperience: 4,
      location: 'Lagos, Nigeria',
      isOnboarded: true,
    },
  });

  // Grace is primarily a CANDIDATE but also recruits as an EMPLOYER.
  const graceEmployerProfile = await prisma.employerProfile.upsert({
    where: { userId: candidateUser2.clerkUserId },
    update: {},
    create: {
      userId: candidateUser2.clerkUserId,
      phone: '08033333333',
      isOnboarded: true,
    },
  });

  // ----------------------------------------------------------------------
  // Companies (keyed on slug)
  // ----------------------------------------------------------------------
  const company = await prisma.company.upsert({
    where: { slug: 'sainthr' },
    update: {},
    create: {
      employerProfileId: employerProfile.id,
      name: 'SaintHR',
      slug: 'sainthr',
      description: 'A hiring platform.',
      website: 'https://sainthr.dev',
      location: 'Lagos, Nigeria',
    },
  });

  const fintechCompany = await prisma.company.upsert({
    where: { slug: 'lagos-fintech' },
    update: {},
    create: {
      employerProfileId: employerProfile.id, // same employer can own multiple companies
      name: 'Lagos Fintech Co',
      slug: 'lagos-fintech',
      description: 'Payments infrastructure for African businesses.',
      website: 'https://lagosfintech.example.com',
      location: 'Lagos, Nigeria',
    },
  });

  const brightwave = await prisma.company.upsert({
    where: { slug: 'brightwave' },
    update: {},
    create: {
      employerProfileId: employerProfile2.id,
      name: 'BrightWave Technologies',
      slug: 'brightwave',
      description: 'Remote-first product studio building developer tools.',
      website: 'https://brightwave.io',
      location: 'Remote',
    },
  });

  // Owned by Grace via her secondary EMPLOYER role.
  await prisma.company.upsert({
    where: { slug: 'okafor-studio' },
    update: {},
    create: {
      employerProfileId: graceEmployerProfile.id,
      name: 'Okafor Studio',
      slug: 'okafor-studio',
      description: 'Freelance design studio that hires contractors.',
      location: 'Abuja, Nigeria',
    },
  });

  // ----------------------------------------------------------------------
  // Jobs (keyed on slug; spread across companies, enums, statuses)
  // ----------------------------------------------------------------------
  const day = 24 * 60 * 60 * 1000;
  const deadlineIn = (days: number) => new Date(Date.now() + days * day);

  const backendJob = await prisma.job.upsert({
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
      applicationDeadline: deadlineIn(30),
    },
  });

  const frontendJob = await prisma.job.upsert({
    where: { slug: 'senior-frontend-engineer' },
    update: {},
    create: {
      companyId: company.id,
      title: 'Senior Frontend Engineer',
      slug: 'senior-frontend-engineer',
      description: 'Own the candidate-facing web app and design system.',
      requirements: 'React, TypeScript, Next.js, Tailwind',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      locationType: LocationType.REMOTE,
      city: 'Lagos',
      country: 'Nigeria',
      salaryMin: 700000,
      salaryMax: 1100000,
      currency: 'NGN',
      status: JobStatus.OPEN,
      applicationDeadline: deadlineIn(21),
    },
  });

  const leadJob = await prisma.job.upsert({
    where: { slug: 'lead-platform-engineer' },
    update: {},
    create: {
      companyId: fintechCompany.id,
      title: 'Lead Platform Engineer',
      slug: 'lead-platform-engineer',
      description: 'Lead the platform team and own infrastructure strategy.',
      requirements: 'Kubernetes, Terraform, AWS, Go',
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.LEAD,
      locationType: LocationType.HYBRID,
      city: 'Lagos',
      country: 'Nigeria',
      salaryMin: 1500000,
      salaryMax: 2200000,
      currency: 'NGN',
      status: JobStatus.OPEN,
      applicationDeadline: deadlineIn(45),
    },
  });

  await prisma.job.upsert({
    where: { slug: 'data-analyst' },
    update: {},
    create: {
      companyId: fintechCompany.id,
      title: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Analyse transaction data and build reporting dashboards.',
      requirements: 'SQL, Python, dbt, BI tooling',
      employmentType: EmploymentType.PART_TIME,
      experienceLevel: ExperienceLevel.MID,
      locationType: LocationType.REMOTE,
      country: 'Nigeria',
      salaryMin: 400000,
      salaryMax: 600000,
      currency: 'NGN',
      status: JobStatus.CLOSED,
    },
  });

  const devopsJob = await prisma.job.upsert({
    where: { slug: 'devops-engineer' },
    update: {},
    create: {
      companyId: brightwave.id,
      title: 'DevOps Engineer',
      slug: 'devops-engineer',
      description: 'Automate CI/CD and manage cloud infrastructure.',
      requirements: 'Docker, GitHub Actions, Terraform, GCP',
      employmentType: EmploymentType.CONTRACT,
      experienceLevel: ExperienceLevel.MID,
      locationType: LocationType.REMOTE,
      country: 'Ghana',
      salaryMin: 4000,
      salaryMax: 6000,
      currency: 'USD',
      status: JobStatus.OPEN,
      applicationDeadline: deadlineIn(14),
    },
  });

  await prisma.job.upsert({
    where: { slug: 'product-design-intern' },
    update: {},
    create: {
      companyId: brightwave.id,
      title: 'Product Design Intern',
      slug: 'product-design-intern',
      description: 'Support the design team across research and prototyping.',
      requirements: 'Figma, basic UX research',
      employmentType: EmploymentType.INTERNSHIP,
      experienceLevel: ExperienceLevel.ENTRY,
      locationType: LocationType.ONSITE,
      city: 'Accra',
      country: 'Ghana',
      status: JobStatus.DRAFT,
    },
  });

  // ----------------------------------------------------------------------
  // Resumes (deterministic ids -> upsertable; no natural unique key)
  // ----------------------------------------------------------------------
  const michaelResume = await prisma.resume.upsert({
    where: { id: 'seed-resume-michael-primary' },
    update: {},
    create: {
      id: 'seed-resume-michael-primary',
      candidateProfileId: candidateProfile.id,
      fileUrl: 'https://files.example.com/michael-resume.pdf',
      fileName: 'michael-resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 200000,
      isPrimary: true,
    },
  });

  await prisma.resume.upsert({
    where: { id: 'seed-resume-michael-old' },
    update: {},
    create: {
      id: 'seed-resume-michael-old',
      candidateProfileId: candidateProfile.id,
      fileUrl: 'https://files.example.com/michael-resume-old.pdf',
      fileName: 'michael-resume-old.pdf',
      mimeType: 'application/pdf',
      fileSize: 180000,
      isPrimary: false,
    },
  });

  const graceResume = await prisma.resume.upsert({
    where: { id: 'seed-resume-grace' },
    update: {},
    create: {
      id: 'seed-resume-grace',
      candidateProfileId: candidateProfile2.id,
      fileUrl: 'https://files.example.com/grace-resume.pdf',
      fileName: 'grace-resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 240000,
      isPrimary: true,
    },
  });

  const danielResume = await prisma.resume.upsert({
    where: { id: 'seed-resume-daniel' },
    update: {},
    create: {
      id: 'seed-resume-daniel',
      candidateProfileId: candidateProfile3.id,
      fileUrl: 'https://files.example.com/daniel-resume.pdf',
      fileName: 'daniel-resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 260000,
      isPrimary: true,
    },
  });

  // ----------------------------------------------------------------------
  // Job applications (keyed on the @@unique([jobId, candidateProfileId]))
  // ----------------------------------------------------------------------
  const michaelBackendApp = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateProfileId: {
        jobId: backendJob.id,
        candidateProfileId: candidateProfile.id,
      },
    },
    update: {},
    create: {
      jobId: backendJob.id,
      candidateProfileId: candidateProfile.id,
      resumeId: michaelResume.id,
      resumeSnapshotUrl: michaelResume.fileUrl,
      resumeSnapshotData: { fileName: michaelResume.fileName, version: 1 },
      coverLetter: 'Excited to grow as a backend engineer at SaintHR.',
      status: JobApplicationStatus.PENDING,
    },
  });

  const graceFrontendApp = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateProfileId: {
        jobId: frontendJob.id,
        candidateProfileId: candidateProfile2.id,
      },
    },
    update: {},
    create: {
      jobId: frontendJob.id,
      candidateProfileId: candidateProfile2.id,
      resumeId: graceResume.id,
      resumeSnapshotUrl: graceResume.fileUrl,
      resumeSnapshotData: { fileName: graceResume.fileName, version: 1 },
      coverLetter: 'I have led design-system work for 5 years.',
      status: JobApplicationStatus.SHORTLISTED,
    },
  });

  const danielLeadApp = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateProfileId: {
        jobId: leadJob.id,
        candidateProfileId: candidateProfile3.id,
      },
    },
    update: {},
    create: {
      jobId: leadJob.id,
      candidateProfileId: candidateProfile3.id,
      resumeId: danielResume.id,
      resumeSnapshotUrl: danielResume.fileUrl,
      resumeSnapshotData: { fileName: danielResume.fileName, version: 1 },
      coverLetter: 'Ready to lead a platform team.',
      status: JobApplicationStatus.REVIEWED,
    },
  });

  const danielDevopsApp = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateProfileId: {
        jobId: devopsJob.id,
        candidateProfileId: candidateProfile3.id,
      },
    },
    update: {},
    create: {
      jobId: devopsJob.id,
      candidateProfileId: candidateProfile3.id,
      resumeId: danielResume.id,
      resumeSnapshotUrl: danielResume.fileUrl,
      status: JobApplicationStatus.HIRED,
    },
  });

  // Michael -> DevOps (REJECTED), snapshot only, no linked resume
  await prisma.jobApplication.upsert({
    where: {
      jobId_candidateProfileId: {
        jobId: devopsJob.id,
        candidateProfileId: candidateProfile.id,
      },
    },
    update: {},
    create: {
      jobId: devopsJob.id,
      candidateProfileId: candidateProfile.id,
      resumeSnapshotUrl: michaelResume.fileUrl,
      status: JobApplicationStatus.REJECTED,
    },
  });

  // ----------------------------------------------------------------------
  // Application status history (deterministic ids -> upsertable)
  // ----------------------------------------------------------------------
  await seedStatusHistory([
    {
      id: 'seed-hist-grace-1',
      jobApplicationId: graceFrontendApp.id,
      oldStatus: null,
      newStatus: JobApplicationStatus.PENDING,
      changedByUserId: employerUser.clerkUserId,
      note: 'Application received.',
    },
    {
      id: 'seed-hist-grace-2',
      jobApplicationId: graceFrontendApp.id,
      oldStatus: JobApplicationStatus.PENDING,
      newStatus: JobApplicationStatus.REVIEWED,
      changedByUserId: employerUser.clerkUserId,
      note: 'Strong portfolio.',
    },
    {
      id: 'seed-hist-grace-3',
      jobApplicationId: graceFrontendApp.id,
      oldStatus: JobApplicationStatus.REVIEWED,
      newStatus: JobApplicationStatus.SHORTLISTED,
      changedByUserId: employerUser.clerkUserId,
      note: 'Moving to interview round.',
    },
    {
      id: 'seed-hist-daniel-devops-1',
      jobApplicationId: danielDevopsApp.id,
      oldStatus: null,
      newStatus: JobApplicationStatus.PENDING,
      changedByUserId: employerUser2.clerkUserId,
    },
    {
      id: 'seed-hist-daniel-devops-2',
      jobApplicationId: danielDevopsApp.id,
      oldStatus: JobApplicationStatus.PENDING,
      newStatus: JobApplicationStatus.REVIEWED,
      changedByUserId: employerUser2.clerkUserId,
      note: 'Excellent infrastructure experience.',
    },
    {
      id: 'seed-hist-daniel-devops-3',
      jobApplicationId: danielDevopsApp.id,
      oldStatus: JobApplicationStatus.REVIEWED,
      newStatus: JobApplicationStatus.HIRED,
      changedByUserId: adminUser.clerkUserId,
      note: 'Offer accepted.',
    },
    {
      id: 'seed-hist-daniel-lead-1',
      jobApplicationId: danielLeadApp.id,
      oldStatus: JobApplicationStatus.PENDING,
      newStatus: JobApplicationStatus.REVIEWED,
      changedByUserId: employerUser.clerkUserId,
    },
  ]);

  console.log('Seed complete 🚀');
  console.table({
    users: 6,
    employerProfiles: 3,
    candidateProfiles: 4,
    companies: 4,
    jobs: 6,
    resumes: 4,
    applications: 5,
  });
  console.log({
    sampleApplicationId: michaelBackendApp.id,
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
