# animate a (very boring) distance sampling survey
# watch a gif at: http://converged.yt/distance-animation.gif
# written by David Lawrence Miller, with tweaks from Eric Rexstad
# released under the MIT license

library(animation)

# make sure that we get the same result every time...
set.seed(1234)

# need to wrap everything in a function to pass to saveGIF, below...
plotter<-function(){
  
  # how many animals are there to detect?
  n <- 250
  # generate animals unformly over (0,1)x(0,1)
  xy.dat <- data.frame(x=runif(n),
                       y=runif(n))
  
  # sort the points by y (bottom to top)
  # this is the direction in which we go along the transect
  xy.dat <- xy.dat[order(xy.dat$y),]
  
  # give each point an id
  xy.dat$id <- 1:n
  
  # list of transects
  n.transects <- 10
  transects <- lapply(as.list(seq(0.05,0.95,len=n.transects)),
                      function(x){
                        list(x=c(x,x),
                             y=c(0,1))
                      })
  
  # vector to hold indices of detected points
  detected <- rep(FALSE,nrow(xy.dat))
  
  # vector to hold histogram of distances
  histdat <- c(0)
  
  # side-by-side survey area and histogram
  par(mfrow=c(1,2))
  
  # loop over transects
  for(tr.id in 1:n.transects){
    
    # pick out the current transect
    this.tr <- transects[[tr.id]]
    
    # calculate all distances to this transect first
    ddist <- abs(this.tr$x[1]-xy.dat$x)
    
    # loop over the possibly observed animals
    for(j in seq_along(xy.dat[,1])){
      
      # take this observation
      obs <- xy.dat[j,]
      # was the animal detected?
      #detected[obs$id] <- TRUE # strip transects
      # half-nformal detection function with sigma=0.04
      # do rejection sampling
      sigma <- 0.02
      this.detected <- (exp(-ddist[j]^2/(2*sigma^2)) > runif(1))
      # maybe it was already detected? don't un-detect it!
      detected[obs$id] <- detected[obs$id] | this.detected
      
      # only do this animation stuff when we detect something
      if(this.detected){
        # plot whole study area and all "animals"
        plot(xy.dat$x, xy.dat$y, axes=FALSE, asp=1,
             xlab="", ylab="",
             main="Survey area",
             xlim=c(-0.01,1.01), ylim=c(-0.01,1.01),
             pch=20,cex=0.7,col=grey(0.7))
        
        # plot transect centre lines for transects already covered
        lapply(transects[1:tr.id],lines, lty=2, col="grey")
        
        if(!is.null(detected)){
          # plot the animals that have been detected so far in blue
          points(xy.dat[detected,c("x","y")], pch=20,cex=0.7,col="blue")
        }
        
        # draw perpendicular line -- from transect to animal
        lines(x = c(this.tr$x[1], obs[1]),
              y = c(obs[2], obs[2]),col="red")
        # add this observation to the histogram
        histdat <- c(histdat,ddist[j])
        
        # draw "along transect" line showing how far we come so far
        lines(x=this.tr$x,y=c(this.tr$y[1],obs[2]),col="red")
        
        ## update the histogram plot
        xmax <- 3.5 * sigma
        hist(histdat,ylim=c(0,35),xlim=c(0,xmax),
             main="Histogram of observed distances",xlab="Distance",
             breaks=seq(0,xmax,len=10))
        #        Sys.sleep(0.5)
        ani.pause()
      } # end if detected stuff
    } # end of current transect loop
  } # end loop over all transects
} # end plotter function

# test it out here, need to replace ani.pause with Sys.sleep(0.5)
#plotter()


saveGIF(plotter(),"distance-animation.gif", interval = 0.2, ani.width = 800,ani.height = 400, outdir=getwd())