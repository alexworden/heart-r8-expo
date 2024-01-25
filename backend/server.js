import app from './app';

const PORT = process.env.PORT || 3000;
app.set('port', PORT);
app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${PORT}`);
});
