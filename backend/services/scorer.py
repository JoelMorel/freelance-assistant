import re
from typing import List, Tuple

PROFILE_KEYWORDS = {
    # High priority core skills (weight 18)
    "react": 18,
    "next.js": 18,
    "nextjs": 18,
    "node": 16,
    "nodejs": 16,
    "node.js": 16,
    "wordpress": 18,
    "woocommerce": 16,
    "e-commerce": 14,
    "ecommerce": 14,
    
    # Core web development skills (weight 10-12)
    "javascript": 12,
    "typescript": 12,
    "frontend": 12,
    "front-end": 12,
    "full stack": 14,
    "full-stack": 14,
    "fullstack": 14,
    "web developer": 12,
    "web development": 12,
    "tailwind": 10,
    "css": 8,
    "html": 6,
    "api": 10,
    "rest api": 10,
    "seo": 12,
    "php": 10,
    "shopify": 12,
    "stripe": 10,
}

NEGATIVE_KEYWORDS = {
    "c++": -30,
    "embedded": -30,
    "ios developer": -25,
    "android developer": -25,
    "flutter": -20,
    "devops engineer": -20,
    "kubernetes": -15,
}

def score_job(title: str, summary: str, tags: List[str]) -> Tuple[int, List[str]]:
    """
    Computes a match score (0-100) and bullet points explaining why the job matches Joel's profile.
    """
    text_corpus = f"{title.lower()} {summary.lower()} {' '.join(t.lower() for t in tags)}"
    
    score = 30  # Baseline interest in web gigs
    matched_reasons = []
    
    # 1. Title matches carry higher weight
    title_lower = title.lower()
    if any(k in title_lower for k in ["react", "next", "frontend", "front-end", "web"]):
        score += 25
        matched_reasons.append("Title strongly matches web/frontend focus")
    elif any(k in title_lower for k in ["wordpress", "woocommerce", "shopify"]):
        score += 25
        matched_reasons.append("Title matches WordPress/e-commerce expertise")
    elif any(k in title_lower for k in ["full stack", "fullstack", "full-stack", "node"]):
        score += 20
        matched_reasons.append("Title matches full-stack development")

    # 2. Check keyword presence
    found_skills = set()
    for kw, weight in PROFILE_KEYWORDS.items():
        # Match as whole word or phrase
        pattern = r"\b" + re.escape(kw) + r"\b"
        if re.search(pattern, text_corpus):
            score += weight
            found_skills.add(kw.title())

    # 3. Deduct for negative matches
    for neg_kw, penalty in NEGATIVE_KEYWORDS.items():
        pattern = r"\b" + re.escape(neg_kw) + r"\b"
        if re.search(pattern, text_corpus):
            score += penalty

    # Cap score between 0 and 100
    final_score = max(5, min(100, score))
    
    if found_skills:
        top_skills = sorted(list(found_skills))[:5]
        matched_reasons.append(f"Matching skills: {', '.join(top_skills)}")
        
    if not matched_reasons:
        matched_reasons.append("General technology/software posting")

    return final_score, matched_reasons
