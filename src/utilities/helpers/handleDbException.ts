import {
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';


export function handleDBException(err: any,):never {
    const logger = new Logger('DBException');

    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }

    if (err.code === '23503') {
      throw new BadRequestException(
        'No se puede completar la operación, referencia inválida',
      );
    }

    if (err.code === '23502') {
      throw new BadRequestException(`Falta un campo requerido: ${err.column}`);
    }

    logger.error(err.message, err.stack);

    throw new InternalServerErrorException(
      'Error inesperado, contacte al administrador',
    );
  }

