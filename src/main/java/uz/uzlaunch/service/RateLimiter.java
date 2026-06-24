package uz.uzlaunch.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class RateLimiter {

    private final Map<String, List<Long>> store = new ConcurrentHashMap<>();
    private final int maxPerWindow;
    private final long windowMs;
    private final AtomicLong lastCleanup = new AtomicLong(System.currentTimeMillis());

    public RateLimiter(int maxPerWindow, long windowMs) {
        this.maxPerWindow = maxPerWindow;
        this.windowMs = windowMs;
    }

    public boolean isAllowed(String key) {
        long now = System.currentTimeMillis();
        maybeCleanup(now);
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

    private void maybeCleanup(long now) {
        long last = lastCleanup.get();
        if (now - last > windowMs && lastCleanup.compareAndSet(last, now)) {
            for (String k : store.keySet()) {
                store.computeIfPresent(k, (kk, l) -> {
                    l.removeIf(t -> now - t > windowMs);
                    return l.isEmpty() ? null : l;
                });
            }
        }
    }
}
