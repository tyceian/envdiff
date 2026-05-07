import {
  annotationLevel,
  buildAnnotation,
  annotateResults,
  filterAnnotationsByLevel,
  formatAnnotation,
  formatAnnotations,
} from "./annotator";
import { DiffResult } from "./diff";

function makeResult(key: string, status: DiffResult["status"]): DiffResult {
  return { key, status, values: {} };
}

describe("annotationLevel", () => {
  it("returns error for missing", () => {
    expect(annotationLevel("missing")).toBe("error");
  });
  it("returns warn for mismatch", () => {
    expect(annotationLevel("mismatch")).toBe("warn");
  });
  it("returns info for ok", () => {
    expect(annotationLevel("ok")).toBe("info");
  });
});

describe("buildAnnotation", () => {
  it("builds annotation for missing key", () => {
    const result = makeResult("DB_HOST", "missing");
    const ann = buildAnnotation(result);
    expect(ann.key).toBe("DB_HOST");
    expect(ann.level).toBe("error");
    expect(ann.message).toContain("missing");
  });

  it("builds annotation for mismatch key", () => {
    const result = makeResult("API_URL", "mismatch");
    const ann = buildAnnotation(result);
    expect(ann.level).toBe("warn");
    expect(ann.message).toContain("mismatch");
  });

  it("builds annotation for ok key", () => {
    const result = makeResult("NODE_ENV", "ok");
    const ann = buildAnnotation(result);
    expect(ann.level).toBe("info");
    expect(ann.message).toContain("consistent");
  });
});

describe("annotateResults", () => {
  it("returns one annotation per result", () => {
    const results = [
      makeResult("A", "ok"),
      makeResult("B", "missing"),
      makeResult("C", "mismatch"),
    ];
    const annotations = annotateResults(results);
    expect(annotations).toHaveLength(3);
  });
});

describe("filterAnnotationsByLevel", () => {
  it("filters to only error level", () => {
    const annotations = annotateResults([
      makeResult("A", "ok"),
      makeResult("B", "missing"),
      makeResult("C", "mismatch"),
    ]);
    const errors = filterAnnotationsByLevel(annotations, "error");
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe("B");
  });
});

describe("formatAnnotation", () => {
  it("includes level and key in output", () => {
    const ann = buildAnnotation(makeResult("SECRET", "missing"));
    const formatted = formatAnnotation(ann);
    expect(formatted).toContain("[ERROR]");
    expect(formatted).toContain("SECRET");
  });
});

describe("formatAnnotations", () => {
  it("returns fallback message for empty list", () => {
    expect(formatAnnotations([])).toBe("No annotations.");
  });

  it("joins multiple annotations with newlines", () => {
    const annotations = annotateResults([
      makeResult("X", "ok"),
      makeResult("Y", "mismatch"),
    ]);
    const output = formatAnnotations(annotations);
    expect(output.split("\n")).toHaveLength(2);
  });
});
