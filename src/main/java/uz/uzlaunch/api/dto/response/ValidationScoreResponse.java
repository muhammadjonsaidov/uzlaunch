package uz.uzlaunch.api.dto.response;

public record ValidationScoreResponse(
        int score,
        long confirmed,
        int volumePoints,
        int commitmentPoints,
        int momentumPoints,
        long wouldUse,
        long wouldPay,
        long payNow
) {}
