import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    /**
     * Verifica se o usuário é o mesmo que organiza o meetup
     */
    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Can't subscribe in your own meetup" });
    }

    /**
     * Verifica se o encontro já ocorreu
     */
    if (meetup.past) {
      return res.status(400).json({ error: "Can't subscribe in past meetups" });
    }

    /**
     * Verifica se o usuário já se inscreveu no mesmo meetup
     */
    const checkIsAlreadySubscribe = await Subscription.findOne({
      where: { id: meetup.id, user_id: req.userId },
    });

    if (checkIsAlreadySubscribe) {
      return res.status(400).json({ error: 'User already subscribed' });
    }

    /**
     * Verifica se o usuário já se inscreveu em um meetup no mesmo horário
     */
    const checkSameDate = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkSameDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe in two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
