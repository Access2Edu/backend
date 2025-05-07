export const addSubject = jest.fn((req, res) => {
    res.status(200).json({ message: 'Subject added successfully' });
  });
  
  export const updateSubject = jest.fn((req, res) => {
    res.status(200).json({ message: 'Subject updated successfully' });
  });
  
  export const deleteSubject = jest.fn((req, res) => {
    res.status(200).json({ message: 'Subject deleted successfully' });
  });
  
  export const fetchAllVideosByLevel = jest.fn((req, res) => {
    res.status(200).json([{ videoUrl: 'http://video1.com', subjectName: 'Math', level: 'Beginner' }]);
  });
  
  export const fetchAllVideosByNameAndLevel = jest.fn((req, res) => {
    res.status(200).json([{ videoUrl: 'http://video2.com', subjectName: 'Physics', level: 'Advanced' }]);
  });
  