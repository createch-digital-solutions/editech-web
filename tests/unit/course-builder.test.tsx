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
    generateOutline: vi.fn(),
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

  it('drafts a course with AI, then adds only the lessons the instructor keeps (SCRUM-42, SCRUM-47)', async () => {
    vi.mocked(courseBuilderApi.generateOutline).mockResolvedValue({
      title: 'Full-Stack React',
      description: 'Build and deploy full-stack apps.',
      category: 'Backend Development',
      level: 'BEGINNER',
      outcomeTag: 'GET_A_JOB',
      tags: ['React', 'Node.js'],
      sections: [
        {
          title: 'Foundations',
          position: 1,
          lessons: [
            { title: 'Intro to React', type: 'VIDEO', position: 1, estimatedDuration: 12, contentSummary: 'Components and JSX.' },
            { title: 'Setting up', type: 'TEXT', position: 2, estimatedDuration: 8, contentSummary: 'Install Node and create a project.' },
            { title: 'Check your understanding', type: 'QUIZ', position: 3, estimatedDuration: 5, contentSummary: 'Quiz.' },
          ],
        },
        { title: 'The backend', position: 2, lessons: [{ title: 'Express basics', type: 'VIDEO', position: 1, estimatedDuration: 15, contentSummary: 'Routes.' }] },
      ],
    });
    let n = 0;
    vi.mocked(courseBuilderApi.addLesson).mockImplementation((sectionId, lesson) =>
      Promise.resolve({ id: `lesson_${++n}`, sectionId, title: lesson.title, position: n, type: lesson.type ?? 'VIDEO', videoUrl: null, videoDuration: 0, isPreview: false })
    );

    render(<CourseBuilder />);
    type('What is your course about?', 'Full-stack apps with React and Node for beginners');
    fireEvent.click(screen.getByRole('button', { name: 'Generate outline' }));

    // The details fill in, mapped onto our own choices, for the instructor to check.
    expect(await screen.findByDisplayValue('Full-Stack React')).toBeInTheDocument();
    expect(courseBuilderApi.generateOutline).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'Full-stack apps with React and Node for beginners' }));
    expect(screen.getByLabelText('Category')).toHaveValue('Web Development');
    expect(screen.getByLabelText('Level')).toHaveValue('BEGINNER');
    expect(screen.getByLabelText('Tags')).toHaveValue('React, Node.js');

    type('Price in naira', '15000');
    fireEvent.click(screen.getByRole('button', { name: /create draft and continue/i }));

    // Review: quizzes can't be saved yet, so 3 lessons are on offer. Drop one, rename one.
    expect(await screen.findByRole('heading', { name: 'Review the AI outline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add 3 lessons to course' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Keep lesson 1 of section 2' }));
    fireEvent.change(screen.getByDisplayValue('Setting up'), { target: { value: 'Set up your machine' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add 2 lessons to course' }));

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Review the AI outline' })).not.toBeInTheDocument());
    expect(courseBuilderApi.addSection).toHaveBeenCalledTimes(1);
    expect(courseBuilderApi.addSection).toHaveBeenCalledWith('course_1', 'Foundations');
    expect(courseBuilderApi.addLesson).toHaveBeenNthCalledWith(1, 'section_1', { title: 'Intro to React', type: 'VIDEO', content: undefined });
    expect(courseBuilderApi.addLesson).toHaveBeenNthCalledWith(2, 'section_1', { title: 'Set up your machine', type: 'TEXT', content: 'Install Node and create a project.' });
    expect(screen.getByText('1. Intro to React')).toBeInTheDocument();
    expect(screen.getByText('2. Set up your machine')).toBeInTheDocument();
    expect(screen.getByText('No video yet')).toBeInTheDocument();
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
