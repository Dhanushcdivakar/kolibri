const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token');
    const octokit = github.getOctokit(token);
    const { context } = github;

    const issueNumber = context.issue.number;
    const assignee = context.payload.assignee;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // Check if the assignee is an external contributor (not a member or owner)
    const { data: collaborators } = await octokit.rest.repos.listCollaborators({
      owner,
      repo,
    });

    const isExternalContributor = !collaborators.some(
      (collab) => collab.login === assignee.login && (collab.role === 'member' || collab.role === 'owner')
    );

    if (isExternalContributor) {
      // Add the label
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: ['community-contribution-in-progress'],
      });
    } else {
      // Remove the label
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: 'community-contribution-in-progress',
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

