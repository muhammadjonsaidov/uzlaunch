package uz.uzlaunch.service;

import org.springframework.stereotype.Service;
import uz.uzlaunch.exception.PageNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class TemplateService {

    public record Template(String slug, String name, String emoji, String category,
                           String defaultProjectName, String defaultTagline, String defaultDescription,
                           String feedbackQuestion, String accentColor) {}

    private static final List<Template> TEMPLATES = List.of(
        new Template("saas",
            "SaaS Product",
            "💻",
            "Software",
            "My SaaS",
            "The simplest way to {do thing} for {audience}.",
            "We're building a SaaS that helps teams stop {pain point}. No more spreadsheets, no more chaos — just {core benefit}. Early access opens at launch.",
            "What's the biggest pain you face today that this could solve?",
            "#6366f1"),
        new Template("ai-tool",
            "AI Tool",
            "🤖",
            "AI",
            "AI {Task} Assistant",
            "AI that {does specific task} 10× faster.",
            "Your AI co-pilot for {workflow}. We've trained models on {dataset/expertise} so you can skip the boring parts and ship faster. Join the beta.",
            "What task would you most want to automate with AI?",
            "#8b5cf6"),
        new Template("newsletter",
            "Newsletter",
            "📰",
            "Content",
            "My Newsletter",
            "Weekly insights on {topic}, delivered every {day}.",
            "A curated newsletter covering {topic} — no fluff, no clickbait. One thoughtful issue per week. Be first to subscribe before public launch.",
            "What kind of content would you find most valuable?",
            "#f59e0b"),
        new Template("course",
            "Online Course",
            "🎓",
            "Education",
            "Master {Skill}",
            "Learn {skill} in {timeframe} — built by practitioners, not theorists.",
            "A practical course teaching {skill} from zero to production-ready. Live cohorts, real projects, peer feedback. Early-bird pricing for waitlist members.",
            "What's your biggest blocker in learning this today?",
            "#10b981"),
        new Template("mobile-app",
            "Mobile App",
            "📱",
            "Apps",
            "My App",
            "The {category} app you've been waiting for.",
            "A delightfully simple mobile app that helps you {core action}. Built for iOS and Android. Be among the first to download at launch.",
            "What features would make you use this daily?",
            "#ec4899"),
        new Template("ecommerce",
            "E-commerce Product",
            "🛍",
            "Commerce",
            "My Product",
            "{Product} — designed in {place}, built to last.",
            "We're launching a product that solves {problem}. Pre-orders open soon with founder-edition pricing for waitlist members only.",
            "What would make this a must-buy for you?",
            "#dc2626"),
        new Template("community",
            "Community / Discord",
            "🌐",
            "Community",
            "My Community",
            "A community for {audience} who care about {topic}.",
            "A curated space to connect with {audience}, share work, get feedback, and grow together. Invite-only at launch — join the waitlist.",
            "What would you want to get out of this community?",
            "#0ea5e9"),
        new Template("game",
            "Indie Game",
            "🎮",
            "Games",
            "My Game",
            "A {genre} game that {hook}.",
            "Indie game where you {core mechanic}. Built solo over {time}. Wishlist soon — join the waitlist for beta keys.",
            "What kind of game experience are you craving?",
            "#7c3aed")
    );

    public List<Template> list() {
        return TEMPLATES;
    }

    public Template get(String slug) {
        return find(slug).orElseThrow(PageNotFoundException::new);
    }

    private Optional<Template> find(String slug) {
        return TEMPLATES.stream().filter(t -> t.slug().equals(slug)).findFirst();
    }
}
