import { Controller, Post, UploadedFile, UseInterceptors, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio', {
    storage: diskStorage({
      destination: './uploads', // Carpeta para almacenar archivos de audio
      filename: (req, file, callback) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        callback(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadFile(@UploadedFile() audio) {
    try {
      // Log para indicar que se ha recibido un archivo de audio
      this.logger.log('Archivo de audio recibido.');

      // Log para mostrar los detalles del archivo de audio
      this.logger.log(audio);

      // Log para indicar que el archivo se ha subido correctamente
      this.logger.log('Archivo de audio subido correctamente');
    } catch (error) {
      // Log para indicar si ocurre un error durante la subida del archivo
      this.logger.error('Error al subir el archivo de audio:', error);
      throw error;
    }
  }
}
