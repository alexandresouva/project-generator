const fs = require('fs');
const path = require('path');

// Diretórios de origem e destino
const templatesDir = path.resolve(__dirname, '../../templates');
const outputDir = path.resolve(__dirname, '../../../dist/templates');

/**
 * Função recursiva para copiar arquivos e diretórios de um diretório de origem para um diretório de destino.
 *
 * @param {string} src - O diretório de origem dos arquivos.
 * @param {string} dest - O diretório de destino para os arquivos copiados.
 */
function copyFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    const stat = fs.statSync(srcFile);

    if (stat.isDirectory()) {
      copyFiles(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

fs.readdir(templatesDir, (err, files) => {
  if (err) {
    console.error(`Erro ao ler o diretório de templates: ${err}`);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(templatesDir, file);
    if (!fs.statSync(filePath).isDirectory()) {
      return;
    }

    const filesPath = path.join(filePath, 'files');
    const outputFilesDir = path.join(outputDir, file, 'files');
    if (!fs.existsSync(filesPath)) {
      return;
    }

    copyFiles(filesPath, outputFilesDir);
  });
});
