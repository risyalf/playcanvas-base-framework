build:
	bun run build-push:debug
copy:
	copy({ PLAYCANVAS_BRANCH_ID: config.self.branch.id, PLAYCANVAS_PROJECT_ID: config.project.id })