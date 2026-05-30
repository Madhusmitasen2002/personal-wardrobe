const service =
    require(
        './wardrobe.service'
    );

const asyncHandler =
    require(
        '../../middleware/async.middleware'
    );

const ApiResponse =
    require(
        '../../utils/ApiResponse'
    );

const upload =
    asyncHandler(

        async (
            req,
            res
        ) => {

            const result =
                await service
                    .upload(

                        req.user.userId,

                        req.file,

                        req.body

                    );

            return res
                .status(201)
                .json(

                    new ApiResponse(

                        201,

                        result,

                        'Uploaded'

                    )

                );

        });

const getMyItems =
    asyncHandler(async (
        req,
        res
    ) => {

        const items =
            await service
                .getMyItems(
                    req.user.userId
                );

        return res
            .status(200)
            .json(

                new ApiResponse(

                    200,

                    items,

                    'Items retrieved'

                )

            );

    });

const getItem =

    asyncHandler(

        async (
            req,
            res
        ) => {

            const result =

                await service
                    .getItem(

                        req.params.id,

                        req.user.userId

                    );

            return res
                .status(200)
                .json(

                    new ApiResponse(

                        200,

                        result,

                        'Item fetched'

                    )

                );

        });

const updateItem =

    asyncHandler(

        async (
            req,
            res
        ) => {

            const result =

                await service
                    .updateItem(

                        req.params.id,

                        req.user.userId,

                        req.body

                    );

            return res
                .status(200)
                .json(

                    new ApiResponse(

                        200,

                        result,

                        'Item updated'

                    )

                );

        });

module.exports = {
    upload,
    getMyItems,
    getItem,
    updateItem
};