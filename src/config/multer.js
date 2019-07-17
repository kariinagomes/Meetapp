/**
 *  multer: lida com envio de arquivo fisico;
 *  crypto: biblioteca padrão do nodejs;
 *  extname: retorna a extensão do arquivo baseado no nome;
 *  resolve: percorrer o caminho da aplicação.
 */
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

/* O storage é como o multer vai guardar nossos arquivos de imagem;
 * Poderia ser, por exemplo, em servidores online p/ armazenamento
 * de arquivos fisicos, mas no nosso caso, vamos guardar dentro dos
 * arquivos da aplicação.
 */
export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // Garantir que o nome do arquivo seja único p/ não sobrescrever
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
