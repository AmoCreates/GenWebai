import { generateResponse } from "../config/openRouter.js";
import websiteModel from "../models/website.model.js";
import userModel from "../models/user.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = (userDescription) => `
YOU ARE A PRINCIPAL PRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEM.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS AND JAVASCRIPT
THAT WORK PERFECTLY ON ALL SCREEN SIZES.
THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO OTHER FRAMEWORKS
❌ NO LIBRARIES
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPNOSVIE LAYOUTS

----------------------------------------
USER REQUIREMEMTS:
"${userDescription}"
----------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
----------------------------------------
- Premium, modern UI(2026-2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (No lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

----------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
----------------------------------------
THIS WEBSITE MUST BE FULLLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔️ Mobiel-first CSS approach
✔️ Responsive layout for:
    - Mobile (<768px)
    - Tablet (768px-1024px)
    - Desktop (>1024px)

✔️ Use:
  - Css Grid / Flexbox
  - Relative untis (%, rem, vw)
  - Media queries

✔️ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stack on mobile
  - Sections stack vertcially on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - NO horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE -> RESPONSE IS INVALID.

---------------------------------
IMAGES (MANDATORY & RESPONSIVE)
---------------------------------

- Use high-quality images only from:
  https://unsplash.com/ , 
  https://in.pinterest.com/ , 
  https://www.pexels.com/ 
- EVERY image URL must include:
  ?auto=format&fit=crop&w=1200&q=80

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

---------------------------------
TECHNICAL RULES (VERY IMPORTANT)
---------------------------------
- Output one single HTML file
- Exactly one <style> tag
- Exactly one <script> tag
- No external CSS / JS / fonts
- Use system fonts only
- iframe srcdoc compatible
- SPA-style navigation using javascript
- NO page reloads
- No dead UI
- No broken buttons

-------------------------------
SPA VISIBILITY RULE (MANDATORY)
-------------------------------
- Pages MUST NOT be hidden permanently
- If page { display: none} is used, then .page.active { display: block} is REQUIRED
- At least ONE page MUST be visible on initial load
- Hiding all content is INVALID

-------------------------------
REQUIRED SPA PAGES
-------------------------------
- Home
- About
- Services / Features
- Contact

-------------------------------
FUNCTIONAL REQUIREMENTS
-------------------------------
- Navigation must switch pages using JS
- Active nav state must update
- Forms must have JS validation
- Buttons must show hover + active states
- Smooth section/page transitions

-------------------------------
FINAL SELF-CHECK (MANDATORY)
-------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Media queries are present and used
6. Navigation works on all screen sizes
7. At least ONE page is visible without user interaction

IF ANY CHECK FAILS -> RESPONSIVE IS INVALID

-------------------------------
OUTPUT FORMAT (RAW JSON ONLY):
-------------------------------
Return ONLY a valid JSON object. No markdown, no backticks.
{
    "title": "Website Title",
    "message": "Short description of what was built.",
    "code": "<Full valid  HTML Document>",
    "slug": "unique-slug"
}

-------------------------------
ABSOLUTE RULES
-------------------------------
- RETURN RAW JSON ONLY
- NO markdown
- NO explanations
- NO extra text
- Format must match exactly
- If format is broken -> response is invalid

-------------------------------
MOST IMPORTANT THING
-------------------------------
Write clean but concise code. Use modern CSS (like Flexbox/Grid) to reduce total line count. Do not include long comments inside the code. Ensure the total response is under 15,000 characters
`;

export const generateWebiste = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "prompt is required" });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    if (user.credits < 50) {
      return res.status(400).json({ message: "insufficient credits" });
    }

    const fullPrompt = masterPrompt(prompt);

    let response = await generateResponse(fullPrompt);
    let message = response.choices[0].message.content;
    const finalData = await extractJson(message);

    for (let i = 0; i < 3 && !finalData; i++) {
      response = await generateResponse(fullPrompt);
      finalData = await extractJson(message);
      if (!finalData) {
        finalData = await generateResponse(
          fullPrompt + "\n\nRETURN ONLY RAW JSON.",
        );
      }
      if (finalData) {
        break;
      }
    }

    if (!finalData.code) {
      return res.status(500).json({ message: "invalid response by ai" });
    }

    const website = await websiteModel.create({
      user: user._id,
      title: finalData.title,
      latestCode: finalData.code,
      slug: finalData.slug,
      conversation: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "ai",
          content: finalData.message,
        },
      ],
    });

    user.credits -= 50;
    await user.save();

    return res.status(200).json({
      websiteId: website._id,
      remainingCredits: user.credits,
    });
  } catch (error) {
    return res.status(500).json({
      message: `something went wrong!! try again, generate webiste error: ${error}`,
    });
  }
};

export const getWebsite = async (req, res) => {
  try {
    const website = await websiteModel.findById({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) {
      return res.status(404).json({ message: "website not found" });
    }

    return res.status(200).json(website);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `something went wrong!! try again, get website error: ${error}`,
    });
  }
};

export const updateWebsite = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "prompt is required" });

    const website = await websiteModel.findById({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!website) return res.status(404).json({ message: "website not found" });

    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(401).json({ message: "user not found" });

    if (user.credits < 25) {
      return res.status(400).json({ message: "insufficient credits" });
    }

    const updatePrompt = `
        ### ROLE: Senior Web Architect
        UPDATE THIS WEBSITE.

        ###IF THERE USER PROMPT REQUIRED IMAGES TO ADD OR SOMETHING LIKE THIS:
        Use high-quality images only from:
        https://unsplash.com/ , 
        https://in.pinterest.com/ , 
        https://www.pexels.com/ 
        OR MUST BE YOUR CHOICE IF YOU FIND BETTER
      - EVERY image URL must include:
        ?auto=format&fit=crop&w=1200&q=80

      - Images must:
        - Be responsive (max-width: 100%)
        - Resize correctly on mobile
        - Never overflow containers
        
        CURRENT CODE:
        ${website.latestCode}
        
        USER REQUEST:
        ${prompt} and please don't change the any other page please , remember don't change any other page or other thing except the user request and if you find that user request is not clear then ask him to be more specific but don't change anything until he ask you to change and also make sure to follow the responsive design rules and other rules that i will give you below
        
        ### RULES:
        1. Return ONLY a valid JSON object.
        2. Format: {"message": "short description", "code": "full updated code"}
        3. Do not use markdown backticks.
        `;

    // Direct Gemini call using your new config
    let response = await generateResponse(updatePrompt);
    let message = response.choices[0].message.content;
    const finalData = await extractJson(message);

    if (!finalData || !finalData.code) {
      return res.status(500).json({ message: "invalid response by ai" });
    }

    // Push to conversation and update code
    website.conversation.push({ role: "user", content: prompt });
    website.conversation.push({ role: "ai", content: finalData.message });
    website.latestCode = finalData.code;
    await website.save();

    // Deduct exactly 25 credits as per your logic
    user.credits -= 25;
    await user.save();

    return res.status(200).json({
      message: finalData.message,
      code: finalData.code,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `something went wrong!! ${error.message}` });
  }
};

export const saveWebsiteCode = async (req, res) => {
  try {
    const { code } = req.body;
    const websiteId = req.params.id;

    if (!code) {
      return res.status(400).json({ message: "Code is required to save" });
    }

    const website = await websiteModel.findOne({
      _id: websiteId,
      user: req.user._id,
    });

    if (!website) {
      return res
        .status(404)
        .json({ message: "Website not found or unauthorized" });
    }

    if (website.latestCode === code) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
        latestCode: website.latestCode,
      });
    }

    website.latestCode = code;
    await website.save();

    return res.status(200).json({
      success: true,
      message: "Changes saved successfully 🎉",
      latestCode: website.latestCode,
    });
  } catch (error) {
    console.error("Save Website Error:", error);
    return res.status(500).json({
      message: `Something went wrong while saving: ${error.message}`,
    });
  }
};

export const deleteWebsite = async (req, res) => {
  try {
    const website = await websiteModel.findById({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!website) {
      return res.status(404).json({ message: "website not found" });
    }
    await website.deleteOne();
    return res.status(200).json({ message: "website deleted successfully" });
  } catch (error) {}
};

export const getAllWebsites = async (req, res) => {
  try {
    const websites = await websiteModel.find({ user: req.user._id });
    return res.status(200).json(websites);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `something went wrong!! try again, getAll website error: ${error}`,
    });
  }
};

export const deploy = async (req, res) => {
  try {
    const website = await websiteModel.findById({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!website) {
      return res.status(404).json({ message: "Error in deployment" });
    }

    if (!website.slug) {
      website.slug =
        website.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 10) + website._id.toString().slice(-5);
    }

    website.isDeployed = true;
    website.deployedUrl = `${process.env.FRONTEND_URL}/site/${website.slug}`;
    await website.save();

    return res.status(200).json({
      message: "website deployed successfully",
      url: website.deployedUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `something went wrong!! try again, deploy website error: ${error}`,
    });
  }
};

export const getBySlug = async (req, res) => {
  try {
    const website = await websiteModel.findOne({
      slug: req.params.slug,
    });

    if (!website) {
      return res.status(404).json({ message: "website not found" });
    }

    return res.status(200).json(website);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `something went wrong!! try again, get website by slug error: ${error}`,
    });
  }
};
