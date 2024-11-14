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

/**
 * Função para apagar um diretório e seu conteúdo recursivamente.
 *
 * @param {string} dirPath - O caminho do diretório a ser apagado.
 */
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const currentPath = path.join(dirPath, file);
      const stat = fs.statSync(currentPath);

      if (stat.isDirectory()) {
        deleteDirectory(currentPath); // Recursão para diretórios
      } else {
        fs.unlinkSync(currentPath); // Remover arquivo
      }
    });
    fs.rmdirSync(dirPath); // Remover o diretório vazio
  }
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

    // Apagar a pasta 'files' no diretório de destino, se existir
    if (fs.existsSync(outputFilesDir)) {
      deleteDirectory(outputFilesDir);
    }

    // Copiar os arquivos para o diretório de destino
    copyFiles(filesPath, outputFilesDir);
  });
});
