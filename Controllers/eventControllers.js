const Event = require('../Models/eventModel');
const factory = require('./handlerFactory');

exports.getAllEvents = factory.getAll(Event);
exports.createEvent = factory.createOne(Event);
exports.getEvent = factory.getOne(Event);
exports.updateEvent = factory.updateOne(Event);
exports.deleteEvent = factory.deleteOne(Event);

// exports.deleteEvent = catchAsync(async (req, res, next) => {
//   const event = await Event.findByIdAndDelete(req.params.id);
//   if (!event) {
//     return next(new AppError('No event found with this ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.getWeeklyEvents = async (req, res) => {
//   try {
//     const year = req.params.year * 1;
//     const plan = await Event.aggregate([
//        {
//          $unwind: '$StartDates',
//        },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };
