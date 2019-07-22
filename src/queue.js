import 'dotenv/config';

import Queue from './lib/Queue';

/**
 * Fazendo dessa forma, a fila não vai influenciar na
 * performance da nossa aplicação
 */
Queue.processQueue();
