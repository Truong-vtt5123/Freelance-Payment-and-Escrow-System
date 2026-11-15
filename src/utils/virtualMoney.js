const SCALE = 1_000_000;

function toUnits(value) {
    const raw = String(value ?? "").trim();

    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(raw)) {
        throw new Error(
            "Số tiền phải lớn hơn 0 và có tối đa 6 chữ số thập phân."
        );
    }

    const [whole, fraction = ""] = raw.split(".");

    const units =
        Number(whole) * SCALE +
        Number(fraction.padEnd(6, "0"));

    if (!Number.isSafeInteger(units) || units <= 0) {
        throw new Error("Số tiền không hợp lệ.");
    }

    return units;
}

function fromUnits(units) {
    if (
        !Number.isSafeInteger(units) ||
        units < 0
    ) {
        throw new Error("Số dư lưu trong MongoDB không hợp lệ.");
    }

    return Number((units / SCALE).toFixed(6));
}

module.exports = {
    SCALE,
    toUnits,
    fromUnits
};