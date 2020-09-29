import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import path = require('path');

export const files = {
    channelThumbnailDirectory: 'files/channel-thumbnails',
    attachmentsDirectory: 'files/attachments',
    articleThumbnailDirectory: 'files/article-thumbnails',
};

const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Apenas imagens são permitidas.'), false);
      }
      callback(null, true);
}

const attachmentsFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(
            new BadRequestException(
                `Arquivos com extensão "${path.parse(file.originalname).ext}" não são permitidos para envio.`
            ), false);
      }
      callback(null, true);
}

export const channelThumbnailStorage = {
    storage: diskStorage({
        destination: `./${files.channelThumbnailDirectory}`,
        filename: (req, file, callback) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') +'-'+ Date.now()
            const extension: string = path.parse(file.originalname).ext;

            callback(null, `${filename}${extension}`)
        }
    }),
    fileFilter: imageFileFilter
};

export const fileStorage = {
    storage: diskStorage({
        destination: `./${files.attachmentsDirectory}`,
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') +'-'+ Date.now()
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    }),
    fileFilter: attachmentsFileFilter
};

export const articleThumbnailStorage = {
    storage: diskStorage({
        destination: `./${files.articleThumbnailDirectory}`,
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') +'-'+ Date.now()
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    }),
    fileFilter: imageFileFilter
};