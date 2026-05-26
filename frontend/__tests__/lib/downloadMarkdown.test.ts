import { buildDownloadFilename, downloadMarkdown } from '@/lib/downloadMarkdown';

describe('buildDownloadFilename', () => {
  it('builds filename from two company names', () => {
    expect(buildDownloadFilename('Acme Corp', 'Beta LLC')).toBe('mutual-nda-acme-corp-beta-llc.md');
  });

  it('converts spaces to hyphens and lowercases', () => {
    expect(buildDownloadFilename('Alpha Inc', 'Gamma Ltd')).toBe('mutual-nda-alpha-inc-gamma-ltd.md');
  });

  it('strips special characters', () => {
    expect(buildDownloadFilename('Foo & Bar!', 'Baz (Co.)')).toBe('mutual-nda-foo--bar-baz-co.md');
  });

  it('handles empty strings', () => {
    expect(buildDownloadFilename('', '')).toBe('mutual-nda--.md');
  });

  it('handles single word names', () => {
    expect(buildDownloadFilename('Alpha', 'Beta')).toBe('mutual-nda-alpha-beta.md');
  });

  it('trims leading and trailing spaces', () => {
    expect(buildDownloadFilename('  Acme  ', '  Beta  ')).toBe('mutual-nda-acme-beta.md');
  });
});

describe('downloadMarkdown', () => {
  let createElementSpy: jest.SpyInstance;
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let clickSpy: jest.Mock;
  let mockAnchor: HTMLAnchorElement;

  beforeEach(() => {
    clickSpy = jest.fn();
    mockAnchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;

    createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) =>
        tag === 'a' ? mockAnchor : document.createElement(tag)
      );
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

    (URL.createObjectURL as jest.Mock).mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an anchor element and triggers a click', () => {
    downloadMarkdown('# Test', 'test.md');
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('sets the correct download filename', () => {
    downloadMarkdown('# Test', 'my-nda.md');
    expect(mockAnchor.download).toBe('my-nda.md');
  });

  it('sets href to the blob URL', () => {
    downloadMarkdown('# Test', 'test.md');
    expect(mockAnchor.href).toBe('blob:mock-url');
  });

  it('appends and removes the anchor from the body', () => {
    downloadMarkdown('content', 'file.md');
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
  });

  it('calls URL.revokeObjectURL after download', () => {
    downloadMarkdown('content', 'file.md');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('creates a Blob with the correct content type', () => {
    const blobSpy = jest.spyOn(global, 'Blob').mockImplementation((parts, opts) => {
      return { parts, opts } as unknown as Blob;
    });
    downloadMarkdown('hello world', 'test.md');
    expect(blobSpy).toHaveBeenCalledWith(['hello world'], { type: 'text/markdown' });
    blobSpy.mockRestore();
  });
});
