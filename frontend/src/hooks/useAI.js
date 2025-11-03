import { useMutation } from 'react-query';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export const useAI = () => {

  // Career Guidance
  const careerGuidanceMutation = useMutation({
    mutationFn: async (jobInterests) => {
      const response = await api.post('/ai/career-guidance', { jobInterests });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Career guidance generated successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate career guidance');
    }
  });

  // CV Optimization
  const cvOptimizationMutation = useMutation({
    mutationFn: async ({ cvText, jobDescription }) => {
      const response = await api.post('/ai/cv-optimize', { cvText, jobDescription });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('CV optimization completed!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to optimize CV');
    }
  });

  // Interview Preparation
  const interviewPrepMutation = useMutation({
    mutationFn: async ({ jobDescription, experienceLevel }) => {
      const response = await api.post('/ai/interview-prep', { jobDescription, experienceLevel });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Interview questions generated!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate interview questions');
    }
  });

  // Career Chat
  const careerChatMutation = useMutation({
    mutationFn: async (message) => {
      const response = await api.post('/ai/career-chat', { message });
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  });

  // Smart Job Search
  const smartSearchMutation = useMutation({
    mutationFn: async (searchQuery) => {
      const response = await api.post('/ai/smart-search', { searchQuery });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Smart recommendations generated!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate recommendations');
    }
  });

  // Job Description Generation
  const jobDescriptionMutation = useMutation({
    mutationFn: async (jobDetails) => {
      const response = await api.post('/ai/generate-job-description', { jobDetails });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Job description generated!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate job description');
    }
  });

  // Candidate Screening
  const candidateScreeningMutation = useMutation({
    mutationFn: async ({ cvText, jobRequirements }) => {
      const response = await api.post('/ai/screen-candidate', { cvText, jobRequirements });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Candidate screening completed!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to screen candidate');
    }
  });

  // Recruitment Insights
  const recruitmentInsightsMutation = useMutation({
    mutationFn: async ({ jobData, marketData }) => {
      const response = await api.post('/ai/recruitment-insights', { jobData, marketData });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Recruitment insights generated!');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate insights');
    }
  });

  // Recruiter Chat
  const recruiterChatMutation = useMutation({
    mutationFn: async (message) => {
      const response = await api.post('/ai/recruiter-chat', { message });
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  });

  return {
    // Job Seeker functions
    generateCareerGuidance: careerGuidanceMutation.mutateAsync,
    optimizeCV: cvOptimizationMutation.mutateAsync,
    prepareInterview: interviewPrepMutation.mutateAsync,
    chatWithCareerAssistant: careerChatMutation.mutateAsync,
    smartJobSearch: smartSearchMutation.mutateAsync,

    // Employer functions
    generateJobDescription: jobDescriptionMutation.mutateAsync,
    screenCandidate: candidateScreeningMutation.mutateAsync,
    getRecruitmentInsights: recruitmentInsightsMutation.mutateAsync,
    chatWithRecruiterAssistant: recruiterChatMutation.mutateAsync,

    // Loading states
    careerGuidanceLoading: careerGuidanceMutation.isPending,
    cvOptimizationLoading: cvOptimizationMutation.isPending,
    interviewPrepLoading: interviewPrepMutation.isPending,
    careerChatLoading: careerChatMutation.isPending,
    smartSearchLoading: smartSearchMutation.isPending,
    jobDescriptionLoading: jobDescriptionMutation.isPending,
    candidateScreeningLoading: candidateScreeningMutation.isPending,
    recruitmentInsightsLoading: recruitmentInsightsMutation.isPending,
    recruiterChatLoading: recruiterChatMutation.isPending,
  };
};