import File from '../models/File';

class FileController {
  async store(req, res) {
    /**
     * originalname: na base seria o name;
     * filename: como salvei no meu diretório temp
     */
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
