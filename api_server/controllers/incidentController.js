exports.uploadIncident = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { guardId, deviceId, incidentDetails } = req.body;

    // Ideally, we'd save the incident details and file path to the database here
    // For now, we return success as we successfully received the multipart/form-data video offload
    
    res.status(200).json({
      message: 'Incident video uploaded successfully',
      fileDetails: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      },
      metadata: {
        guardId,
        deviceId,
        incidentDetails
      }
    });
  } catch (error) {
    console.error('Error uploading incident:', error);
    next(error);
  }
};
