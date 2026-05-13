/** URLSearchParams builder pattern wrapper */
export class ParamsBuilder {
  private inner: URLSearchParams;

  /**
   * Creates a new ParamsBuilder instance.
   * @param base - An optional existing {@link URLSearchParams} to wrap.
   */
  public constructor(base?: URLSearchParams) {
    this.inner = base ?? new URLSearchParams();
  }

  /**
   * Appends a new query parameter.
   * @param name - The name of the parameter.
   * @param value - The value of the parameter.
   * @returns The current instance for method chaining.
   */
  public push(name: string, value: string): ParamsBuilder {
    this.inner.append(name, value);
    return this;
  }

  /**
   * Finalizes the builder and returns the query string.
   * @returns The serialized query parameters as a string.
   */
  public finalize(): string {
    return this.inner.toString();
  }

  /**
   * Returns the underlying {@link URLSearchParams} instance.
   *
   * @note **Terminal Operation**: This method transfers ownership of the
   * internal state. Do not use this builder instance after calling this method.
   *
   * @returns The raw URLSearchParams object.
   */
  public asInner(): URLSearchParams {
    return this.inner;
  }
}
