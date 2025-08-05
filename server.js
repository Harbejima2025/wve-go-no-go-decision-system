// server.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// POST endpoint to save submission
app.post('/api/save-to-github', async (req, res) => {
  try {
    const data = req.body; // expects JSON object with form responses

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = 'your-github-username-or-org';
    const repoName = 'your-repo-name';
    const branch = 'main';
    const path = `submissions/GoNoGo_${new Date().toISOString().slice(0,10)}_${Date.now()}.json`;

    // Get the SHA of the latest commit for the file creation
    const getRefUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`;
    const refResponse = await axios.get(getRefUrl, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const commitSha = refResponse.data.object.sha;

    // Get the tree SHA for the latest commit
    const commitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits/${commitSha}`;
    const commitResponse = await axios.get(commitUrl, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const treeSha = commitResponse.data.tree.sha;

    // Prepare content base64
    const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Create blob
    const blobUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`;
    const blobResponse = await axios.post(blobUrl, {
      content: contentBase64,
      encoding: 'base64'
    }, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const blobSha = blobResponse.data.sha;

    // Create new tree with this file
    const newTreeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`;
    const newTreeResponse = await axios.post(newTreeUrl, {
      base_tree: treeSha,
      tree: [{
        path: path,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      }]
    }, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const newTreeSha = newTreeResponse.data.sha;

    // Create a new commit
    const newCommitUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`;
    const newCommitResponse = await axios.post(newCommitUrl, {
      message: `Add GoNoGo submission ${path}`,
      tree: newTreeSha,
      parents: [commitSha]
    }, {
      headers: { Authorization: `token ${githubToken}` }
    });

    const newCommitSha = newCommitResponse.data.sha;

    // Update the ref to point to the new commit
    const updateRefUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`;
    await axios.patch(updateRefUrl, {
      sha: newCommitSha
    }, {
      headers: { Authorization: `token ${githubToken}` }
    });

    res.json({ status: 'success', message: 'Submission saved to GitHub' });

  } catch (error) {
    console.error('Error saving to GitHub:', error.response?.data || error.message);
    res.status(500).json({ status: 'error', message: 'Failed to save submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
