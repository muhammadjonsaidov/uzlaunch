package uz.uzlaunch.api.dto.response;

import java.util.List;

public record PagedResponse<T>(List<T> items, int page, int totalPages, long total) {}