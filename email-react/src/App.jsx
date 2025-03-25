import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Container from "@mui/material/Container"
import TypoGraphy from "@mui/material/Typography"
import Box from "@mui/material/Box"
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from "@mui/material/InputLabel"
import MenuItem from '@mui/material//MenuItem'
import Select from "@mui/material/Select"
import { CircularProgress, Button } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from "axios"
function App() {
  // track of email content
  // application take email conent and tone as input
  const [tone, setTone] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async () => {
    // make an api request
    setLoading(true)
    setError('');
    try{
      const response=await axios.post("http://localhost:8080/api/email/generate",
        {
          emailContent,
          tone
        }
      )
      if(response.data=='string')setGeneratedReply(response.data)
      else setGeneratedReply(JSON.stringify(response.data))
    }catch(error){
      console.log(error);
      setError("Failed to generate email reply: Try Again")
      
    } finally{
      setLoading(false)
    }
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <TypoGraphy variant='h3' gutterBottom component='h1'>
          EMAIL REPLY GENERATOR
        </TypoGraphy>
        {/* box is for containing items */}
        <Box sx={{ mx: 3 }}>
          <TextField fullWidth multiline rows={7} variant="outlined"
            label="Email Content" value={emailContent || ""}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 2 }} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tone (Optional)</InputLabel>
            <Select value={tone || ""} label="Tone" onChange={(e) => setTone(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
              <MenuItem value="Serious/Angry">Serious</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" fullWidth
            onClick={handleSubmit} disabled={!emailContent || loading}>
            {loading ? <CircularProgress size={24} /> : "Generate Reply"}
          </Button>

        </Box>

        {error && (
          <TypoGraphy color='error'>
            {error}
          </TypoGraphy>
        )}

        {/* box for generted reply */}
        {generatedReply && (
          <Box sx={{ mt: 3 }}>
            <TypoGraphy variant='h6' gutterBottom>
              Generated Reply:
            </TypoGraphy>
            <TextField inputProps={{ readOnly: true }} fullWidth multiline rows={6} variant='outlined' value={generatedReply || ""} />
            {/* button to copy the text generated */}
            <Button style={{alignItems:"right"}} variant='outlined' sx={{ mt: 2 }} onClick={() => navigator.clipboard.writeText(generatedReply)}>
              <ContentCopyIcon/>
            </Button>
          </Box>
        )}

      </Container>
    </>
  )
}

export default App
