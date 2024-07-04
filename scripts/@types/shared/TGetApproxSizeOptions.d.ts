interface TNormalizedFloatStrOptions {
  /** Fixed point position */
  fixedPoint?: number;
  stripFixedZeros?: boolean;
}

interface TGetApproxSizeOptions {
  /** Normalize result to string representation using `normalizedFloatStr` */
  normalize?: boolean | TNormalizedFloatStrOptions;
}
