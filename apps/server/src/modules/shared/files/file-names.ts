export function getExtension({ fileName }: { fileName: string }) {
  const parts = fileName.split('.');

  if (parts.length === 1) {
    return { extension: undefined };
  }

  const extension = parts.at(-1);

  if (extension === '') {
    return { extension: undefined };
  }

  return { extension };
}

export function getFileNameWithoutExtension({ fileName }: { fileName: string }) {
  const parts = fileName.split('.');

  if (parts.length === 1) {
    return fileName;
  }

  const fileNameWithoutExtension = parts.slice(0, -1).join('.');

  return { fileNameWithoutExtension };
}
