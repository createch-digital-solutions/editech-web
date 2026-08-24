export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  status: CourseStatus;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}
