export interface Candidate {
  id: string;
  name: string;
  salutation: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  board: string;
  workArea: string;
  duration: string;
  educationStatus?: 'pursuing' | 'graduated';
}
