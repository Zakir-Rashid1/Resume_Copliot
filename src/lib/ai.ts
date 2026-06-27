import { AISuggestion, ATSSubscores, MockQuestion, ResumeContent } from "./db";

// AI Core Service that bridges live API calls and heuristic simulations
// Helper to extract multiple Gemini keys from environment variable (comma-separated)
const getGeminiKeys = (): string[] => {
  const rawKey = process.env.GEMINI_API_KEY || "";
  if (!rawKey) return [];
  return rawKey.split(",").map(k => k.trim()).filter(k => k.length > 0);
};

// Rotates keys and executes callback, routing to the next key on rate-limit/errors
const tryGeminiCall = async <T>(callFn: (key: string) => Promise<T>): Promise<T> => {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API Keys configured.");
  }

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      return await callFn(key);
    } catch (err: any) {
      console.warn(`[Gemini Rotation] Key #${i + 1} failed: ${err.message || err}. Trying next key...`);
      lastError = err;
    }
  }
  throw lastError || new Error("All Gemini API keys failed.");
};

// AI Core Service that bridges live API calls and heuristic simulations
export const ai = {
  /**
   * Main entrypoint to analyze resume text.
   */
  async analyzeResume(rawText: string, content: ResumeContent): Promise<{
    atsScore: number;
    subscores: ATSSubscores;
    suggestions: AISuggestion[];
    roastText: string;
  }> {
    let result;
    const keys = getGeminiKeys();
    const openAiKey = process.env.OPENAI_API_KEY;

    if (keys.length > 0) {
      try {
        result = await tryGeminiCall((key) => this.callGeminiAnalysis(rawText, content, key));
      } catch (err) {
        console.error("All Gemini keys failed or rate-limited. Falling back to OpenAI or simulation.", err);
      }
    }
    
    if (!result && openAiKey) {
      try {
        result = await this.callOpenAiAnalysis(rawText, content, openAiKey);
      } catch (err) {
        console.error("OpenAI analysis failed, falling back to simulation:", err);
      }
    }

    if (!result) {
      result = this.simulateAnalysis(rawText, content);
    }

    // Override formatting subscore to be 98% if the resume is using one of our built-in templates
    // (since our built-in templates have perfect margins and formatting compliance)
    if (content.template && result.subscores) {
      result.subscores.formatting = 98;
      
      const sub = result.subscores;
      result.atsScore = Math.round(
        ((sub.compatibility || 90) * 0.15) +
        ((sub.keywordMatch || 80) * 0.15) +
        ((sub.formatting || 85) * 0.1) +
        ((sub.readability || 80) * 0.1) +
        ((sub.impact || 75) * 0.15) +
        ((sub.skills || 75) * 0.15) +
        ((sub.projects || 80) * 0.1) +
        ((sub.education || 80) * 0.1)
      );
    }

    return result;
  },

  /**
   * Compares resume content against a job description.
   */
  async matchJobDescription(content: ResumeContent, jobDescription: string): Promise<{
    matchScore: number;
    missingKeywords: string[];
    recommendedChanges: string[];
  }> {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      try {
        return await tryGeminiCall((key) => this.callGeminiMatch(content, jobDescription, key));
      } catch (e) {
        console.error("All Gemini keys failed or rate-limited for JD match:", e);
      }
    }

    return this.simulateJobMatch(content, jobDescription);
  },

  /**
   * Generates a tailored cover letter.
   */
  async generateCoverLetter(
    content: ResumeContent,
    jobDescription: string,
    tone: "Formal" | "Professional" | "Creative"
  ): Promise<string> {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      try {
        return await tryGeminiCall((key) => this.callGeminiCoverLetter(content, jobDescription, tone, key));
      } catch (e) {
        console.error("All Gemini keys failed or rate-limited for cover letter:", e);
      }
    }

    return this.simulateCoverLetter(content, jobDescription, tone);
  },

  /**
   * Generates LinkedIn profile suggestions.
   */
  async optimizeLinkedIn(content: ResumeContent): Promise<{
    suggestedHeadline: string;
    suggestedAbout: string;
    suggestions: string[];
  }> {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      try {
        return await tryGeminiCall((key) => this.callGeminiLinkedIn(content, key));
      } catch (e) {
        console.error("All Gemini keys failed or rate-limited for LinkedIn optimization:", e);
      }
    }

    return this.simulateLinkedIn(content);
  },

  /**
   * Generates mock interview questions.
   */
  async generateInterviewQuestions(
    content: ResumeContent,
    jobDescription: string
  ): Promise<MockQuestion[]> {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      try {
        return await tryGeminiCall((key) => this.callGeminiInterview(content, jobDescription, key));
      } catch (e) {
        console.error("All Gemini keys failed or rate-limited for interview questions:", e);
      }
    }

    return this.simulateInterview(content, jobDescription);
  },

  /**
   * Evaluates mock interview answers.
   */
  async gradeInterviewAnswer(
    question: string,
    answer: string
  ): Promise<{
    feedback: string;
    score: number;
    suggestedAnswer: string;
  }> {
    const keys = getGeminiKeys();
    if (keys.length > 0) {
      try {
        return await tryGeminiCall((key) => this.callGeminiGrade(question, answer, key));
      } catch (e) {
        console.error("All Gemini keys failed or rate-limited for interview grading:", e);
      }
    }

    return this.simulateInterviewGrade(question, answer);
  },

  // ==========================================
  // REAL API CLIENT CALLS (GEMINI & OPENAI)
  // ==========================================

  validateGeminiResponse(data: any) {
    if (!data) {
      throw new Error("Empty response from Gemini API.");
    }
    if (data.error) {
      throw new Error(`Gemini API Error: ${data.error.status || "Unknown Status"} - ${data.error.message || "No message provided"}`);
    }
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini API Error: No candidates returned in response.");
    }
    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API Error: Empty candidate content returned.");
    }
    return candidate.content.parts[0].text || "";
  },

  validateOpenAiResponse(data: any) {
    if (!data) {
      throw new Error("Empty response from OpenAI API.");
    }
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message || "Unknown error"}`);
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error("OpenAI API Error: No choices returned in response.");
    }
    return data.choices[0].message?.content || "";
  },

  async callGeminiAnalysis(rawText: string, content: ResumeContent, key: string) {
    const prompt = `Analyze this resume and provide an ATS score, subscores, detailed fixes, and a funny roast.
    Return JSON format strictly matching this structure:
    {
      "atsScore": 85,
      "subscores": {
        "compatibility": 90, "keywordMatch": 80, "formatting": 88, "readability": 80, 
        "impact": 75, "skills": 82, "projects": 80, "education": 95
      },
      "suggestions": [
        { "id": "1", "category": "Action Verbs", "section": "experience", "problem": "...", "explanation": "...", "fix": "...", "originalText": "...", "suggestedText": "..." }
      ],
      "roastText": "Humorous roast here..."
    }
    
    Resume Text:
    ${rawText}
    
    Structured Data:
    ${JSON.stringify(content)}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.0
        }
      })
    });
    const data = await res.json();
    const jsonText = this.validateGeminiResponse(data);
    return JSON.parse(jsonText);
  },

  async callOpenAiAnalysis(rawText: string, content: ResumeContent, key: string) {
    const prompt = `Analyze this resume and provide an ATS score, subscores, detailed fixes, and a funny roast.
    Return JSON format strictly matching this structure:
    {
      "atsScore": 85,
      "subscores": {
        "compatibility": 90, "keywordMatch": 80, "formatting": 88, "readability": 80, 
        "impact": 75, "skills": 82, "projects": 80, "education": 95
      },
      "suggestions": [
        { "id": "1", "category": "Action Verbs", "section": "experience", "problem": "...", "explanation": "...", "fix": "...", "originalText": "...", "suggestedText": "..." }
      ],
      "roastText": "Humorous roast here..."
    }
    
    Resume Text:
    ${rawText}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.0,
        messages: [
          { role: "system", content: "You are a helpful ATS parsing assistant." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await res.json();
    const jsonText = this.validateOpenAiResponse(data);
    return JSON.parse(jsonText);
  },

  async callGeminiMatch(content: ResumeContent, jd: string, key: string) {
    const prompt = `Compare this resume content against the job description.
    Return JSON matching:
    {
      "matchScore": 72,
      "missingKeywords": ["Docker", "Kubernetes"],
      "recommendedChanges": ["Add Docker deployment details", "..."]
    }
    Resume Content: ${JSON.stringify(content)}
    Job Description: ${jd}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    const jsonText = this.validateGeminiResponse(data);
    return JSON.parse(jsonText);
  },

  async callGeminiCoverLetter(content: ResumeContent, jd: string, tone: string, key: string) {
    const currentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const prompt = `Write a tailored cover letter in a ${tone} tone based on this resume and job description. Return the plain text response.

    IMPORTANT INSTRUCTIONS:
    1. Do NOT output generic bracketed placeholders (such as "[Your Name]", "[Your Address]", "[Your Phone Number]", "[Your Email]", "[Date]", "[Hiring Manager Name]", "[Hospitals/Organization Name]").
    2. Do NOT output a placeholder followed by the real value (for example, do NOT write "[Your Name]\nMurtaza Bashir"). Write the actual details directly, e.g., "Murtaza Bashir" or "Murtaza.Bashir@gmail.com".
    3. Use the candidate's real name, email, phone, location, and links from the Resume data to format a professional header at the start.
    4. Use the current date: ${currentDate}. Always include this date in the cover letter.
    5. If a specific recipient detail (like the hiring manager's name or address) is unknown, format the salutation formally (e.g., "Dear Hiring Team at [Company],") and omit the address details rather than writing placeholders.
    6. Ensure the letter flows formally, beginning with candidate info, followed by the date, greeting, body paragraphs, and a closing signature block (e.g., "Sincerely,\n\nMurtaza Bashir").
    7. Keep the letter concise, aiming for roughly 250 to 300 words. It must fit beautifully on a single A4 page.

    Resume: ${JSON.stringify(content)}
    JD: ${jd}`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await res.json();
    return this.validateGeminiResponse(data);
  },

  async callGeminiLinkedIn(content: ResumeContent, key: string) {
    const prompt = `Optimize this candidate's LinkedIn headline and about section.
    Return JSON matching:
    {
      "suggestedHeadline": "...",
      "suggestedAbout": "...",
      "suggestions": ["Include keywords X", "..."]
    }
    Resume: ${JSON.stringify(content)}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    const jsonText = this.validateGeminiResponse(data);
    return JSON.parse(jsonText);
  },

  async callGeminiInterview(content: ResumeContent, jd: string, key: string) {
    const prompt = `Generate 4 mock interview questions based on the candidate's resume and job description.
    Return JSON matching:
    [
      { "id": "1", "question": "...", "category": "Technical", "suggestedAnswer": "..." }
    ]
    Resume: ${JSON.stringify(content)}
    JD: ${jd}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    const jsonText = this.validateGeminiResponse(data);
    return JSON.parse(jsonText);
  },

  async callGeminiGrade(question: string, answer: string, key: string) {
    const prompt = `Grade this candidate's interview answer.
    Return JSON matching:
    {
      "feedback": "constructive feedback",
      "score": 85,
      "suggestedAnswer": "model answer"
    }
    Question: ${question}
    Answer: ${answer}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    const data = await res.json();
    const jsonText = this.validateGeminiResponse(data);
    return JSON.parse(jsonText);
  },

  // ==========================================
  // RULES-BASED HEURISTICS ENGINE (FALLBACK)
  // ==========================================

  simulateAnalysis(rawText: string, content: ResumeContent) {
    const suggestions: AISuggestion[] = [];
    const keywordsInResume = content.skills.map((s) => s.toLowerCase());

    // Weak verbs detection
    const weakVerbsMap = [
      { weak: "worked on", strong: "Engineered", explanation: "'Worked on' is passive. Use active, technical terms." },
      { weak: "responsible for", strong: "Spearheaded", explanation: "'Responsible for' sounds like a job duty list. Emphasize ownership." },
      { weak: "assisted with", strong: "Orchestrated", explanation: "'Assisted' minimizes your contribution. Detail your exact role." },
      { weak: "helped", strong: "Streamlined", explanation: "'Helped' is generic. Define the mechanism of improvement." },
      { weak: "used", strong: "Implemented", explanation: "'Used' is elementary. Explain the application and architecture." },
    ];

    let bulletIdCounter = 1;

    content.experience.forEach((exp) => {
      exp.description.forEach((bullet) => {
        // Look for weak verbs
        for (const rule of weakVerbsMap) {
          if (bullet.toLowerCase().includes(rule.weak)) {
            const regex = new RegExp(rule.weak, "i");
            const metricsInBullet = /\d+%|\$\d+|\d+x|\d+ hours/i.test(bullet);

            // Create suggestion
            suggestions.push({
              id: `suggest-exp-${bulletIdCounter++}`,
              category: "Action Verbs",
              section: "experience",
              problem: `Passive phrasing: "${rule.weak}"`,
              explanation: `${rule.explanation} Using action verbs highlights your execution.`,
              fix: `Replace "${rule.weak}" with "${rule.strong}". ${!metricsInBullet ? "Consider adding a quantifiable metric (e.g. reduced latency by 15%, increased sales by $20k)." : ""}`,
              originalText: bullet,
              suggestedText: bullet.replace(regex, rule.strong) + (!metricsInBullet ? " achieving an optimized 20% performance gain" : "")
            });
            break; // only one suggestion per bullet to avoid spam
          }
        }

        // Check for missing metrics
        const hasNumbers = /\d+/.test(bullet);
        if (!hasNumbers && suggestions.length < 5) {
          suggestions.push({
            id: `suggest-metric-${bulletIdCounter++}`,
            category: "Quantifiable Results",
            section: "experience",
            problem: "Lack of measurable impact statement",
            explanation: "Recruiters and ATS favor bullet points that highlight scope and metrics.",
            fix: "Incorporate numbers, percentages, dollar amounts, or timelines to validate your output.",
            originalText: bullet,
            suggestedText: bullet + " resulting in a 25% increase in operational efficiency"
          });
        }
      });
    });

    // Check Skills Section
    const crucialKeywords = ["docker", "ci/cd", "kubernetes", "typescript", "cloud", "aws", "agile", "testing", "rest api"];
    const missingCrucial = crucialKeywords.filter((k) => !keywordsInResume.includes(k));

    if (missingCrucial.length > 0) {
      suggestions.push({
        id: `suggest-skills-1`,
        category: "Keywords",
        section: "skills",
        problem: `Missing relevant technology terms: ${missingCrucial.slice(0, 3).join(", ")}`,
        explanation: "Modern tech roles and ATS filters filter candidate files based on these standards.",
        fix: `Add relevant skills like ${missingCrucial.slice(0, 3).join(", ")} to your skills inventory if you possess experience with them.`,
      });
    }

    // Check Summary
    if (!content.summary || content.summary.length < 50) {
      suggestions.push({
        id: "suggest-sum-1",
        category: "Readability",
        section: "summary",
        problem: "Short or missing professional overview",
        explanation: "A compelling summary highlights your career level and domain expertise.",
        fix: "Draft a 3-sentence summary summarizing your key technical skill, years of experience, and target value."
      });
    }

    // Calculate subscores
    const skillsScore = Math.min(60 + content.skills.length * 4, 100);
    const educationScore = content.education.length > 0 ? 95 : 50;
    const projectScore = content.projects.length > 0 ? 88 : 40;
    const formattingScore = content.personalInfo.email && content.personalInfo.phone ? 92 : 60;
    const keywordMatchScore = Math.max(100 - missingCrucial.length * 8, 50);
    
    // Readability: count suggestions
    const readabilityScore = Math.max(100 - suggestions.filter(s => s.category === "Readability").length * 15, 60);
    const impactScore = Math.max(100 - suggestions.filter(s => s.category === "Quantifiable Results").length * 12, 55);

    const subscores: ATSSubscores = {
      compatibility: 90,
      keywordMatch: keywordMatchScore,
      formatting: formattingScore,
      readability: readabilityScore,
      impact: impactScore,
      skills: skillsScore,
      projects: projectScore,
      education: educationScore,
    };

    const atsScore = Math.round(
      (subscores.compatibility * 0.15) +
      (subscores.keywordMatch * 0.15) +
      (subscores.formatting * 0.1) +
      (subscores.readability * 0.1) +
      (subscores.impact * 0.15) +
      (subscores.skills * 0.15) +
      (subscores.projects * 0.1) +
      (subscores.education * 0.1)
    );

    // Generate Roast
    const roasts = [
      `Your resume reads like a list of tasks your manager told you to do, not actual achievements. Did you execute these, or were you just present in the building?`,
      `Listing 'Git' as a major tech skill in 2026 is like listing 'can type on a keyboard'. We assume you know it; let's show how you deploy instead of how you commit.`,
      `This summary objective feels like a greeting card from a corporate lobby. 'Results-oriented team player looking to add value' tells me nothing about what you can build. Let's be concrete!`,
      `You have projects but no metrics. 'Created customer application' is equivalent to saying 'I wrote code'. Who used it? How much faster was it? Give us something to measure!`,
      `Formatting looks like an essay outline. If an ATS parsing engine tries to read this, it's going to throw a syntax error. Let's optimize the structure.`
    ];
    const roastText = roasts[Math.floor(Math.random() * roasts.length)] + ` (Score: ${atsScore}/100)`;

    return {
      atsScore,
      subscores,
      suggestions,
      roastText,
    };
  },

  simulateJobMatch(content: ResumeContent, jd: string) {
    const jdLower = jd.toLowerCase();
    const skillsMatched: string[] = [];
    const missingKeywords: string[] = [];

    // Core list of standard tools/terms
    const techWords = [
      "react", "typescript", "javascript", "node", "express", "mongodb", "postgresql", "sql", "git", 
      "docker", "kubernetes", "aws", "azure", "ci/cd", "python", "django", "flask", "java", "spring", 
      "c++", "rust", "go", "graphql", "rest", "graphql", "tailwind", "next.js", "agile", "scrum", "terraform",
      "machine learning", "tensorflow", "pytorch", "analytics", "dashboard", "css", "html"
    ];

    techWords.forEach((word) => {
      const isInJd = jdLower.includes(word);
      const isInResume = content.skills.some((s) => s.toLowerCase().includes(word)) ||
                         content.experience.some((e) => e.description.some((d) => d.toLowerCase().includes(word)));

      if (isInJd) {
        if (isInResume) {
          skillsMatched.push(word.toUpperCase());
        } else {
          missingKeywords.push(word.toUpperCase());
        }
      }
    });

    // Handle fallbacks if JD does not have many matches
    if (missingKeywords.length === 0 && skillsMatched.length === 0) {
      missingKeywords.push("DOCKER", "CI/CD", "AWS SERVICES", "UNIT TESTING");
    }

    const totalDemands = skillsMatched.length + missingKeywords.length;
    const matchScore = totalDemands > 0 ? Math.round((skillsMatched.length / totalDemands) * 100) : 75;

    const recommendedChanges = missingKeywords.map((kw) => {
      return `Include experience using **${kw}** in your projects or recent job descriptions.`;
    });
    
    recommendedChanges.push("Add automated integration testing details to your experience bullets.");
    recommendedChanges.push("Optimize the resume summary to speak to requirements listed in this job listing.");

    return {
      matchScore: Math.min(matchScore, 98), // Cap at 98 for realism
      missingKeywords,
      recommendedChanges
    };
  },

  simulateCoverLetter(content: ResumeContent, jd: string, tone: string): string {
    const name = content.personalInfo.name || "Job Seeker";
    const email = content.personalInfo.email || "applicant@email.com";
    const phone = content.personalInfo.phone || "(555) 000-0000";
    const position = content.experience[0]?.position || "Software Engineer";
    const companyMatch = jd.match(/(?:at|for|join)\s+([A-Z][a-zA-Z0-9\s]{2,15})(?:\s+Inc|\s+LLC|\s+Corporation)?/);
    const company = companyMatch ? companyMatch[1] : "Your Company";

    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const greeting = `Dear Hiring Team at ${company},\n\n`;
    let opening = "";
    let body = "";
    let closing = "";

    if (tone === "Formal") {
      opening = `I am writing to express my enthusiastic interest in the ${position} position at ${company}. With a strong foundation in software engineering and extensive experience delivering scalable web systems, I am confident in my ability to make a meaningful contribution to your organization.`;
      body = `Throughout my career, I have developed technical proficiency in tools like ${content.skills.slice(0, 4).join(", ")}. In my prior role at ${content.experience[0]?.company || "InnovateTech"}, I successfully spearheaded key initiatives, including engineering responsive application components and optimizing server-side algorithms, resulting in measurable efficiency achievements. I pride myself on maintaining high standards of code architecture and collaborative excellence.`;
      closing = `Thank you for your time and consideration of my candidacy. I look forward to the opportunity to discuss how my technical skills and professional goals align with the strategic requirements of ${company}.\n\nSincerely,\n\n${name}`;
    } else if (tone === "Professional") {
      opening = `I was excited to come across the ${position} opening at ${company}. Having spent years building clean solutions and optimizing systems, I believe my background aligns perfectly with what you are looking for in this role.`;
      body = `Looking at my background, I specialize in ${content.skills.slice(0, 4).join(", ")}. For example, during my time at ${content.experience[0]?.company || "InnovateTech Systems"}, I worked closely with product and cross-functional teams to build applications, manage system resources, and reduce latency. I enjoy resolving complex engineering bottlenecks and implementing scalable features that improve user experience.`;
      closing = `I would welcome the chance to speak further about how my experience matches what ${company} is building. Thank you for your review.\n\nBest regards,\n\n${name}`;
    } else {
      // Creative
      opening = `I love building clean interfaces and solving complex architectural puzzles. When I saw the ${position} opening at ${company}, I knew I had to apply—I share your commitment to innovative, high-impact user experiences.`;
      body = `My toolbox centers around ${content.skills.slice(0, 4).join(", ")}, which I've used to build everything from responsive client-side dashboards to optimized server-side APIs. At ${content.experience[0]?.company || "InnovateTech"}, I didn't just write code; I collaborated with teams to completely redesign systems, boost execution speeds, and bring premium designs to life. I thrive in fast-paced environments where learning and building go hand-in-hand.`;
      closing = `Let's schedule a chat to discuss how I can help launch the next wave of features at ${company}. Cheers!\n\n${name}`;
    }

    return `${name}\n${email} | ${phone}\n\n${dateStr}\n\n${greeting}${opening}\n\n${body}\n\n${closing}`;
  },

  simulateLinkedIn(content: ResumeContent) {
    const role = content.experience[0]?.position || "Software Engineer";
    const skillsPart = content.skills.slice(0, 4).join(" | ");
    
    const suggestedHeadline = `${role} | Building Scalable Web Applications | Specialist in ${skillsPart}`;
    
    const suggestedAbout = `I am a results-driven Professional specializing in ${content.skills.slice(0, 6).join(", ")}. With a proven track record of designing, developing, and deploying robust applications, I love transforming complex business logic into clean, user-friendly solutions.\n\nKey Achievements:\n${content.experience.map(e => `• Spearheaded critical work at ${e.company} as ${e.position}`).slice(0, 2).join("\n")}\n\nI am always interested in connecting with fellow builders and exploring new opportunities in technical domains. Let's connect!`;

    const suggestions = [
      "Your headline should focus on job titles AND value propositions, not just 'Student' or 'Engineer'.",
      "Include a detailed 'Core Competencies' list in your About section to boost recruiters' keyword searches.",
      "Add direct links to your GitHub projects in your Featured Section to show, not just tell."
    ];

    return {
      suggestedHeadline,
      suggestedAbout,
      suggestions
    };
  },

  simulateInterview(content: ResumeContent, jd: string): MockQuestion[] {
    const role = content.experience[0]?.position || "Software Engineer";
    const coreTech = content.skills[0] || "TypeScript";
    const project = content.projects[0]?.name || "Web Application";

    const hasSpecificJd = jd && jd.trim().length > 0;
    const jdContext = hasSpecificJd ? " for this target role" : "";

    return [
      {
        id: "q-1",
        question: `Tell me about yourself and your background as a ${role}${jdContext}.`,
        category: "HR",
        suggestedAnswer: "Walk through your career path in chronological order, highlighting 2 main technical achievements. Explain why you are excited about this role and how your skills fit."
      },
      {
        id: "q-2",
        question: `How do you handle asynchronous operations in ${coreTech}? Can you explain the difference between promises and async/await?`,
        category: "Technical",
        suggestedAnswer: "Asynchronous operations can be managed using callbacks, promises, or async/await. Async/await provides a cleaner, synchronous-looking syntax on top of promises. Always handle errors using try/catch blocks."
      },
      {
        id: "q-3",
        question: `In your ${project} project, what was the biggest technical challenge you faced and how did you resolve it?`,
        category: "Project-Based",
        suggestedAnswer: "Use the STAR method (Situation, Task, Action, Result). Outline the bottleneck, the specific tech you selected to fix it, your execution, and the final impact (e.g. reduced load times by 40%)."
      },
      {
        id: "q-4",
        question: `Describe a situation where you had a disagreement with a team member on a design choice. How did you reach a resolution?`,
        category: "Behavioral",
        suggestedAnswer: "Describe a professional disagreement. Explain how you listened, looked at objective trade-offs (e.g. bundle size, execution speed), documented the decision, and supported the team consensus."
      }
    ];
  },

  simulateInterviewGrade(question: string, answer: string) {
    const ansLower = answer.toLowerCase();
    
    // Check answer length and keywords to score
    let score = 50;
    let feedback = "";
    let suggestedAnswer = "";

    if (answer.trim().length < 15) {
      score = 40;
      feedback = "Your answer is too short. Try to elaborate on your points, provide context, and cite a concrete example from your resume.";
      suggestedAnswer = "A strong answer should span at least 3-4 sentences. Use the STAR framework for project questions: outline the Situation, the Task at hand, your Action, and the quantifiable Result.";
    } else {
      // Analyze structure
      const hasStar = ansLower.includes("result") || ansLower.includes("because") || ansLower.includes("solved") || ansLower.includes("impact");
      const hasExamples = ansLower.includes("for example") || ansLower.includes("such as") || ansLower.includes("instance");
      
      if (hasStar) score += 20;
      if (hasExamples) score += 15;
      
      score = Math.min(score + Math.floor(Math.random() * 15), 95);
      
      if (score >= 80) {
        feedback = "Excellent response! You provided logical structure, gave solid technical examples, and connected your experience directly. You clearly communicated the value proposition.";
      } else {
        feedback = "Good foundation, but it lacks specific details. To improve, explicitly mention the names of tools/frameworks you used and add details about the performance impact of your choices.";
      }
      suggestedAnswer = "Use structural paragraphs. Start with a direct answer, back it up with an example from a previous project where you used this skill, explain the business benefit, and summarize your learning.";
    }

    return {
      feedback,
      score,
      suggestedAnswer
    };
  }
};
