import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
// import User from '../models/User';

class MeetupController {
  // Listar meetups organizados pelo usuário logado
  // async index(req, res) {
  //   const meetups = await Meetup.findAll({
  //     where: { user_id: req.userId },
  //     order: ['date'],
  //     limit: 10,
  //     offset: (page)
  //   })
  // }

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

    const { date } = req.body.date;

    /**
     * Verifica se a data é anterior a data atual;
     * (parseISO transforma a string em um objeto date do javascript)
     */
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
