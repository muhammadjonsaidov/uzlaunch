package uz.uzlaunch.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimiter {

    private final Map<String, List<Long>> store = new ConcurrentHashMap<>();
    private final int maxPerWindow;
    private final long windowMs;

    public RateLimiter(int maxPerWindow, long windowMs) {
        this.maxPerWindow = maxPerWindow;
        this.windowMs = windowMs;
    }

    public boolean isAllowed(String key) {
        long now = System.currentTimeMillis();
        boolean[] allowed = {false};
        store.compute(key, (k, list) -> {
            if (list == null) list = new ArrayList<>();
            list.removeIf(t -> now - t > windowMs);
            if (list.size() < maxPerWindow) {
                list.add(now);
                allowed[0] = true;
            }
            return list;
        });
        return allowed[0];
    }
}
