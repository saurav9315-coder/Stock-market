package com.stock.analysis.market;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class HistoricalPriceId implements Serializable {

    private UUID id;
    private Instant timestamp;

    public HistoricalPriceId() {}

    public HistoricalPriceId(UUID id, Instant timestamp) {
        this.id = id;
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HistoricalPriceId that = (HistoricalPriceId) o;
        return Objects.equals(id, that.id) && Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, timestamp);
    }
}
