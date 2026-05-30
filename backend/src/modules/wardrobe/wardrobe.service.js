const repository =
    require(
        './wardrobe.repository'
    );

const cloudinary =
    require(
        '../../config/cloudinary'
    );

const streamifier =
    require(
        'streamifier'
    );

const upload = (
    userId,
    file,
    body
) => {

    return new Promise(
        (resolve, reject) => {

            const stream =
                cloudinary
                    .uploader
                    .upload_stream(

                        { folder: 'outfits' },

                        async (error, result) => {
                            console.log(result);

                            if (error) {

                                return reject(
                                    error
                                );

                            }

                            const item =
                                await repository
                                    .createItem({

                                        userId,

                                        name:
                                            body.name,

                                        category:
                                            body.category,

                                        imageUrl:
                                            result.secure_url, cloudinaryId: result.public_id

                                    });

                            resolve(item);

                        }

                    );

            streamifier
                .createReadStream(
                    file.buffer
                )

                .pipe(stream);

        });

};

const getMyItems = async (userId) => {

    return await repository
        .getItemsByUser(
            userId
        );
    return items;

};

const ApiError =
    require(
        '../../utils/ApiError'
    );

const getItem =
    async (

        itemId,
        userId

    ) => {

        const item =

            await repository
                .getItemById(

                    itemId,
                    userId

                );

        if (!item) {

            throw new ApiError(

                404,

                'Item not found'

            );

        }

        return item;

    };

const updateItem =
    async (

        itemId,
        userId,
        data

    ) => {

        const updatedItem =

            await repository
                .updateItem(

                    itemId,
                    userId,
                    data

                );

        if (!updatedItem) {

            throw new ApiError(

                404,

                'Item not found'

            );

        }

        return updatedItem;

    };
module.exports = {
    upload,
    getMyItems,
    getItem,
    updateItem
};