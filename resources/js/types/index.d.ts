import { Config } from 'ziggy-js';

export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'proktor' | 'guru' | 'siswa';
    classroom_id: number | null;
    photo: string | null;
    password_plain?: string;
}

export interface Subject {
    id: number;
    name: string;
    code: string;
}

export interface Classroom {
    id: number;
    name: string;
    description?: string | null;
    seating_plan?: Record<string, number> | null;
    seating_grid?: { rows: number; cols: number } | null;
}

export interface AcademicYear {
    id: number;
    name: string;
    semester: 'Ganjil' | 'Genap';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    question_banks_count?: number;
    exams_count?: number;
}

export interface Exam {
    id: number;
    title: string;
    duration: number;
    random_question: boolean;
    random_option: boolean;
    show_result: boolean;
    is_practice: boolean;
    subject?: Subject;
    question_bank?: QuestionBank;
    question_bank_id?: number;
    academic_year_id?: number;
    academic_year?: AcademicYear;
}

export interface ExamSession {
    id: number;
    exam_id: number;
    name: string;
    start_time: string;
    end_time: string;
    token: string;
    is_active: boolean;
    participants_count: number;
    submitted_count: number;
    finished_count?: number;
    exam?: Exam;
    classroom?: Classroom;
    exam_users: ExamUser[];
    session?: ExamSession; // relation
}

export interface ExamUser {
    id: number;
    exam_session_id: number;
    user_id: number;
    score: number | null;
    cheat_warnings: number;
    status: 'waiting' | 'working' | 'finished';
    started_at: string | null;
    finished_at: string | null;
    user?: User;
    answers: Answer[];
    exam_session?: ExamSession;
}

export interface Answer {
    id: number;
    exam_user_id: number;
    question_id: number;
    answer_text: string | null;
    is_correct: boolean | null;
    score: number | null;
    question: Question;
}

export interface GuruStats {
    totalQuestionBanks: number;
    totalQuestions: number;
    totalSessions: number;
    totalParticipants: number;
    avgScore: number;
}

export interface ProktorMetrics {
    studentsAtExams: number;
    examFinishes: number;
    runningExams: number;
    completedRate: number;
}

export interface RecentSession extends ExamSession {
    // inherits from ExamSession
}

export interface ActivityFeedItem {
    id: number;
    user_id: number;
    exam_session_id: number;
    status: string;
    cheat_warnings: number;
    score: number | null;
    updated_at: string;
    user: User;
    exam_session: ExamSession;
}

export interface ChartData {
    participation: any[];
    status: any[];
    scores: any[];
}

export interface Question {
    id: number;
    question_bank_id: number;
    type: 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'isian_singkat' | 'menjodohkan' | 'essay';
    question_text: string;
    options: Record<string, string> | null;
    answer_key: string;
    score_default: number;
}

export interface QuestionBank {
    id: number;
    subject_id: number;
    name: string;
    description: string | null;
    subject?: Subject;
    user?: User;
    academic_year_id?: number;
    academic_year?: AcademicYear;
    questions: Question[];
}

export interface QuestionAnalysis {
    id: number;
    type: 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'isian_singkat' | 'menjodohkan' | 'essay';
    question_text: string;
    total_answers: number;
    difficulty_level?: number;
    difficulty_label?: string;
    correct_count?: number;
    option_distribution?: Record<string, number>;
    answer_key?: string;
    scored_count?: number;
    avg_score?: number;
}

export interface PaginationData<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
    from?: number;
    to?: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    active_academic_year?: AcademicYear | null;
    academic_years?: AcademicYear[];
    ziggy: Config & { location: string };
    flash?: {
        success?: string;
        error?: string;
    };
};
