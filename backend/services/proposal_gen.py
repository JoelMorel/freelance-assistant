import os
import openai
from dotenv import load_dotenv

load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

client = None
model_name = "gemini-2.0-flash"

if gemini_key:
    # Use Google Gemini via official OpenAI-compatible endpoint
    client = openai.OpenAI(
        api_key=gemini_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    model_name = "gemini-2.0-flash"
elif openai_key:
    client = openai.OpenAI(api_key=openai_key)
    model_name = "gpt-4o-mini"

PROFILE_CONTEXT = """
You are a senior freelance full-stack web developer named Joel Morel.
Core expertise:
- Modern Frontend: React, Next.js, TypeScript, Tailwind CSS, responsive web apps.
- Backend & APIs: Node.js, Express, REST APIs, database integration.
- CMS & E-commerce: WordPress, WooCommerce, custom themes/plugins, Shopify, Stripe checkout.
- Performance & Optimization: Core Web Vitals, page speed, technical SEO.
Communication style: Direct, concise, consultative, outcome-focused. Never use cheesy filler or robotic generic greetings.
"""

def generate_proposal(title: str, description: str, platform: str = "Upwork", company: str = "", budget: str = "") -> str:
    if not client:
        return f"""Hi there,

I read through your post for "{title}" and can help you execute this efficiently.

Having worked extensively across React, Node.js, and WordPress/e-commerce architectures, my focus is delivering clean, maintainable code with fast turnarounds. 

Quick question to make sure we're aligned: what is your target timeline for this project, and do you have existing design/API docs ready?

Best regards,
Joel Morel"""

    prompt = f"""
Job Title: {title}
Company/Client: {company or 'Client'}
Platform: {platform}
Budget/Rate: {budget or 'Not specified'}
Job Details:
{description}

Instructions:
Write a winning, personalized {platform} proposal (under 180 words).
Structure:
1. Hook: Immediately address their exact challenge or goal (avoid generic greetings).
2. Solution: Outline 2-3 specific steps you will take to deliver this cleanly.
3. Proof: Reference relevant experience in React, Node, or WordPress/e-commerce that directly matches.
4. Call to Action: End with a single, high-value clarifying question that prompts a fast reply.

Return only the final proposal text ready to send.
"""
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": PROFILE_CONTEXT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=350
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Proposal Generator] AI error with {model_name}: {e}")
        return f"""Hi there,

I reviewed your requirements for "{title}". I've built numerous production applications using React, Node.js, and WordPress, and I'd love to help you bring this to completion with clean architecture and speed.

Are you available for a brief chat this week to review the next steps?

Best,
Joel Morel"""
