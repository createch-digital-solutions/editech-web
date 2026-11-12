import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CourseBuilder } from '@/app/(instructor)/portal/(studio)/courses/new/course-builder';
import { courseBuilderApi } from '@/lib/course-builder-api';

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'user_1', firstName: 'Kofi' }, isLoaded: true, isSignedIn: true }),
}));

vi.mock('@/lib/course-builder-api', () => ({
  courseBuilderApi: {
    createCourse: vi.fn().mockResolvedValue({ id: 'course_1', slug: 'pm-101-abcde', status: 'DRAFT' }),
    updateCourse: vi.fn().mockResolvedValue({ id: 'course_1', slug: 'pm-101-abcde', status: 'DRAFT' }),
    addSection: vi.fn().mockResolvedValue({ id: 'section_1', courseId: 'course_1', title: 'Module 1: Basics', position: 1 }),
    addLesson: vi.fn().mockResolvedValue({ id: 'lesson_1', sectionId: 'section_1', title: 'What is a PM?', position: 1, type: 'TEXT', videoUrl: null, videoDuration: 0, isPreview: true }),
    submitCourse: vi.fn().mockResolvedValue({ courseId: 'course_1', status: 'PENDING', message: 'Submitted' }),
  },
  uploadLessonVideo: vi.fn(),
  videoFileDuration: vi.fn().mockResolvedValue(0),
  builderErrorText: (err: unknown) => (err instanceof Error ? err.message : 'Something went wrong.'),
}));

const type = (label: string | RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('Instructor — Course builder', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  it('creates a draft, adds a section and a lesson, then submits it for review', async () => {
    render(<CourseBuilder />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create a course');

    // Details: a title is required and paid courses cost at least ₦1,000.
    fireEvent.click(screen.getByRole('button', { name: /create draft and continue/i }));
    expect(await screen.findByText('Give your course a title.')).toBeInTheDocument();
    type('Title', 'PM 101');
    type('Price in naira', '500');
    expect(screen.getByText('The price must be at least ₦1,000.')).toBeInTheDocument();
    type('Price in naira', '15000');
    type('Cover image link', 'https://example.com/cover.jpg');
    type('Tags', 'Agile, Roadmapping');
    fireEvent.click(screen.getByRole('button', { name: /create draft and continue/i }));

    await waitFor(() =>
      expect(courseBuilderApi.createCourse).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'PM 101', price: 15000, thumbnailUrl: 'https://example.com/cover.jpg', tags: ['Agile', 'Roadmapping'] })
      )
    );

    // Curriculum: a section, then a text lesson marked as a free preview.
    type('Add your first section', 'Module 1: Basics');
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => expect(courseBuilderApi.addSection).toHaveBeenCalledWith('course_1', 'Module 1: Basics'));

    type('Lesson title', 'What is a PM?');
    fireEvent.click(screen.getByRole('radio', { name: 'Text' }));
    type('Lesson text', 'A product manager decides what gets built and why.');
    fireEvent.click(screen.getByRole('checkbox', { name: /free preview/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Add lesson' }));
    await waitFor(() =>
      expect(courseBuilderApi.addLesson).toHaveBeenCalledWith('section_1', expect.objectContaining({ title: 'What is a PM?', type: 'TEXT', isPreview: true }))
    );
    expect(await screen.findByText('1. What is a PM?')).toBeInTheDocument();

    // Review: both required checks pass, so it can be submitted.
    fireEvent.click(screen.getByRole('button', { name: /review and submit/i }));
    expect(screen.getByText('Cover image added')).toBeInTheDocument();
    expect(screen.getByText('1 free preview lesson')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /submit for review/i }));
    await waitFor(() => expect(courseBuilderApi.submitCourse).toHaveBeenCalledWith('course_1'));
    expect(await screen.findByRole('heading', { name: 'Course submitted' })).toBeInTheDocument();
  });

  it('picks the draft back up after a refresh', () => {
    localStorage.setItem(
      'createch:course-draft:user_1',
      JSON.stringify({ courseId: 'course_1', details: { title: 'PM 101', free: true, price: '', thumbnailUrl: '', tags: '' }, sections: [{ id: 'section_1', title: 'Module 1', lessons: [] }] })
    );
    render(<CourseBuilder />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('PM 101');
    expect(screen.getByRole('heading', { name: 'Module 1' })).toBeInTheDocument();
  });
});
