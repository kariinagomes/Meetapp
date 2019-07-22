import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  // Listar meetups organizados pelo usuário logado
  async index(req, res) {
    const page = req.query.page || 1;

    const parsedDate = parseISO(req.query.date);

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  // Cadastrar meetup
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.string().required(),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Verifica se a data é anterior a data atual;
     * (parseISO transforma a string em um objeto date do javascript)
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  // Editar meetup
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Verifica se o usuário é o organizador do meetup
     */
    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: "Can't update this meetup" });
    }

    /**
     * Verifica se o usuário informou data anterior a data atual
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    /**
     * Verifica se a meetup já ocorreu
     */
    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * Verifica se o usuário é o organizador do meetup
     */
    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: "Can't delete this meetup" });
    }

    /**
     * Verifica se a meetup já ocorreu
     */
    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups" });
    }

    /**
     * O cancelamento deve deleter o meetup da base
     */
    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
