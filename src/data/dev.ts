// Composes the JSON payload that the dev-mode page hands off to the client
// runtime via the `<script id="dev-data">` carrier.
import { loadLocalFiles, type LocalFiles } from './dev-files'
import { GH_USER, generateOverview, loadGithubRepos, type Repo } from './dev-github'

export interface DevData {
  user: string
  localProjectName: string
  localFiles: LocalFiles
  githubRepos: Array<{
    name: string
    description: string | null
    url: string
    stars: number
    language: string | null
    archived: boolean
    readme: string
  }>
  overview: string
}

export async function buildDevData(): Promise<DevData> {
  const localFiles = loadLocalFiles()
  const githubRepos: Repo[] = await loadGithubRepos()
  const overview = generateOverview(githubRepos)
  return {
    user: GH_USER,
    localProjectName: 'personal-site',
    localFiles,
    githubRepos: githubRepos.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stars,
      language: r.language,
      archived: r.archived,
      readme: r.readme,
    })),
    overview,
  }
}

// Escape "<" so the JSON is safe to embed inside a <script> tag.
export function serializeDevData(data: DevData): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
