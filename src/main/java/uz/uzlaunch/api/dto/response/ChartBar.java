package uz.uzlaunch.api.dto.response;

import java.util.Map;

public record ChartBar(String label, long count, int height) {

    @SuppressWarnings("unchecked")
    public static ChartBar from(Map<String, Object> map) {
        return new ChartBar(
                (String) map.get("label"),
                ((Number) map.get("count")).longValue(),
                ((Number) map.get("height")).intValue()
        );
    }
}