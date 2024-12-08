export const ImageMock = () =>
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export const mockImageOnload = jest.fn();
export class MockImageClass {
  constructor() {
    setTimeout(() => {
      this.onload(); // simulate success
    }, 100);
  }
  onload = mockImageOnload;
}
