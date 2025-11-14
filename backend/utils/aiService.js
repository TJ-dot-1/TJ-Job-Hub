import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.client = openai;
  }

  // Job Seeker Features

  async generateCareerGuidance(userProfile, jobInterests) {
    try {
      const prompt = `Based on this user profile: ${JSON.stringify(userProfile)}
      And their job interests: ${JSON.stringify(jobInterests)}
      Provide personalized career guidance including:
      1. Career path recommendations
      2. Skill development suggestions
      3. Industry trends
      4. Next steps for career advancement`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating career guidance:', error);
      throw new Error('Failed to generate career guidance');
    }
  }

  async optimizeCV(cvText, jobDescription) {
    try {
      const prompt = `Optimize this CV for the following job description:
      CV: ${cvText}
      Job: ${jobDescription}

      Provide:
      1. Suggested improvements to highlight relevant skills
      2. Better keywords to include
      3. Structure recommendations
      4. Specific changes to make the CV more ATS-friendly`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.6,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error optimizing CV:', error);
      throw new Error('Failed to optimize CV');
    }
  }

  async generateInterviewQuestions(jobDescription, experienceLevel) {
    try {
      const prompt = `Generate interview questions for this job:
      Job Description: ${jobDescription}
      Experience Level: ${experienceLevel}

      Provide 10-15 relevant interview questions including:
      - Technical questions
      - Behavioral questions
      - Situational questions
      - Company culture fit questions`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async chatWithCareerAssistant(message, userContext) {
    try {
      const contextPrompt = `You are a helpful career assistant. User context: ${JSON.stringify(userContext)}
      User message: ${message}

      Provide helpful, actionable advice related to career development, job searching, or professional growth.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a knowledgeable career counselor providing personalized advice.' },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in career chat:', error);
      throw new Error('Failed to process chat message');
    }
  }

  // Employer Features

  async generateJobDescription(jobDetails) {
    try {
      const prompt = `Create a compelling job description for this position:
      ${JSON.stringify(jobDetails)}

      Include:
      1. Engaging job title and summary
      2. Key responsibilities
      3. Required qualifications and skills
      4. Benefits and perks
      5. Company culture highlights
      6. Call to action for applicants`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating job description:', error);
      throw new Error('Failed to generate job description');
    }
  }

  async screenCandidate(cvText, jobRequirements) {
    try {
      const prompt = `Analyze this CV against the job requirements:
      CV: ${cvText}
      Job Requirements: ${JSON.stringify(jobRequirements)}

      Provide:
      1. Match percentage (0-100)
      2. Key matching skills
      3. Missing skills
      4. Overall assessment and ranking recommendation
      5. Interview questions to ask this candidate`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.6,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error screening candidate:', error);
      throw new Error('Failed to screen candidate');
    }
  }

  async generateRecruitmentInsights(jobData, marketData) {
    try {
      const prompt = `Based on this job posting data and market information:
      Job Data: ${JSON.stringify(jobData)}
      Market Data: ${JSON.stringify(marketData)}

      Provide insights on:
      1. Best times to post jobs
      2. Competitive salary ranges
      3. Skill trends in the industry
      4. Candidate sourcing strategies
      5. Retention tips for this role`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating recruitment insights:', error);
      throw new Error('Failed to generate recruitment insights');
    }
  }

  async chatWithRecruiterAssistant(message, employerContext) {
    try {
      const contextPrompt = `You are a recruitment assistant. Employer context: ${JSON.stringify(employerContext)}
      Message: ${message}

      Provide helpful advice on hiring, talent acquisition, or recruitment strategies.`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert recruitment consultant providing strategic hiring advice.' },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error in recruiter chat:', error);
      throw new Error('Failed to process recruiter chat');
    }
  }

  // Utility method for smart job recommendations
  async getSmartJobRecommendations(userProfile, searchQuery) {
    try {
      const prompt = `Find jobs matching this query: "${searchQuery}"
      User Profile: ${JSON.stringify(userProfile)}

      Provide a list of 5-10 job recommendations with:
      1. Job titles
      2. Company names
      3. Locations
      4. Why they match the user's profile
      5. Key requirements`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.6,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error getting smart recommendations:', error);
      throw new Error('Failed to get smart recommendations');
    }
  }
}

export default new AIService();