using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Enums
{
    public enum UserAction
    {

        CourseViewed,
        LessonWatched,
        CoursePreviewed,
        CategoryViewed,
        InstructorViewed,

        CommentPosted,
        CommentEdited,
        CommentDeleted,
        CourseRated,
        ReviewPosted,
        ReviewEdited,
        ReviewDeleted,

        AddedToCart,
        RemovedFromCart,
        WishlistAdded,
        WishlistRemoved,
        CoursePurchased,
        CheckoutInitiated,
        PaymentSucceeded,
        PaymentFailed,

        CourseStarted,
        LessonCompleted,
        CourseCompleted,
        QuizCompleted,
        CertificateGenerated,

        SearchPerformed,
        FilterApplied,
        SortApplied,

        LoggedIn,
        LoginFailed,
        LoggedOut,
        ProfileUpdated,
        PasswordChanged,
        EmailVerified,

        CourseCreated,
        CourseUpdated,
        CourseDeleted,
        LessonAdded,
        LessonUpdated,
        LessonDeleted,
        InstructorCreated,
        InstructorUpdated,
        InstructorDeleted,

        NotificationSent,
        MessageSent,
        SystemError,
        ApiCall
    }

}
